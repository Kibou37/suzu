import { Injectable, Logger } from '@nestjs/common';
import { dealer, dealers } from '@suzuki/shared';
import { CarsService } from '../cars/cars.service';
import { RateLimiter } from '../common/rate-limiter.util';
import { CrmService } from '../crm/crm.service';
import { FinanceService } from '../finance/finance.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ChatMessageDto } from './dto/chat-message.dto';

function toolArgString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export type ChatReply = {
  reply: string;
  source: 'agent' | 'faq' | 'fallback' | 'escalation';
  toolsUsed?: string[];
  suggestions?: string[];
};

type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
};

const QUICK_HINTS = [
  'Which SUVs do you have?',
  'Book a test drive',
  'Estimate finance for $25,000',
  'Service hours and address',
  'Contact a manager',
];

const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_cars',
      description:
        'Search Suzuki inventory on this dealer website. Use for model questions, prices, new/used, body type.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Model name keywords, e.g. Vitara, Jimny, Swift',
          },
          condition: {
            type: 'string',
            enum: ['NEW', 'USED'],
          },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_faq',
      description:
        'Search dealer FAQ knowledge base for policy and ownership answers.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_dealer_info',
      description: 'Get dealership address, phone, hours and map link.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'estimate_finance',
      description: 'Estimate monthly credit or leasing payment in USD.',
      parameters: {
        type: 'object',
        properties: {
          price: { type: 'number' },
          downPayment: { type: 'number' },
          termMonths: { type: 'number' },
          product: { type: 'string', enum: ['credit', 'leasing'] },
        },
        required: ['price'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_manager',
      description:
        'Create a CRM lead when the user asks for a human manager or cannot be helped by the bot.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          customerEmail: { type: 'string' },
        },
        required: ['reason'],
      },
    },
  },
] as const;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly rateLimiter = new RateLimiter(
    60_000,
    Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? 30),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly crmService: CrmService,
    private readonly carsService: CarsService,
    private readonly financeService: FinanceService,
  ) {}

  getQuickReplies(): string[] {
    return QUICK_HINTS;
  }

  isAgentConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
  }

  private rateLimit(ip: string): boolean {
    return this.rateLimiter.check(ip);
  }

  private systemPrompt(): string {
    return [
      `You are the AI sales & service agent for ${dealer.name}, an authorised Suzuki dealership (USA market, USD pricing).`,
      'You help with: models/inventory, test drives, service booking, finance estimates, dealer location, FAQ.',
      'Always use tools when you need live inventory, FAQ facts, finance numbers, or dealer contact details.',
      'Never invent exact stock prices or availability — call search_cars. If unsure, say so and offer catalog or a manager.',
      'Keep answers concise (under 150 words), friendly, and professional.',
      'When mentioning website pages, write paths WITHOUT a leading slash and with normal spaces around them, e.g. catalog, catalog/used, configurator, test-drive, service, finance, dealers, contacts, faq.',
      'Never write paths like /catalog — always catalog. Put a space before and after each path.',
      'If the user wants a human, call escalate_to_manager then confirm next steps.',
      'Refuse off-topic requests (crypto, politics, medical, hacking).',
      `Primary dealer: ${dealer.name}, ${dealer.address}, ${dealer.phone}, ${dealer.email}.`,
    ].join('\n');
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2);
  }

  private async runTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    switch (name) {
      case 'search_cars': {
        const query = toolArgString(args.query).trim().toLowerCase();
        const condition =
          args.condition === 'USED' || args.condition === 'NEW'
            ? args.condition
            : undefined;
        const limit = Math.min(8, Math.max(1, Number(args.limit) || 5));
        const cars = await this.carsService.findAll({ condition });
        const filtered = query
          ? cars.filter(
              (car) =>
                car.name.toLowerCase().includes(query) ||
                car.slug.toLowerCase().includes(query) ||
                (car.trim ?? '').toLowerCase().includes(query),
            )
          : cars;
        return filtered.slice(0, limit).map((car) => ({
          name: car.name,
          slug: car.slug,
          condition: car.condition,
          year: car.year,
          priceUsd: Number(car.price),
          bodyType: car.bodyType,
          url: `catalog/${car.slug}`,
        }));
      }
      case 'search_faq': {
        const query = toolArgString(args.query).trim();
        const tokens = this.tokenize(query);
        const faqs = await this.prisma.fAQ.findMany({
          orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
          take: 80,
        });
        const ranked = faqs
          .map((faq) => {
            const hay = `${faq.question} ${faq.answer}`.toLowerCase();
            const score = tokens.reduce(
              (sum, token) => sum + (hay.includes(token) ? 1 : 0),
              0,
            );
            return { faq, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item) => ({
            question: item.faq.question,
            answer: item.faq.answer,
            category: item.faq.category,
          }));
        return ranked;
      }
      case 'get_dealer_info':
        return {
          primary: {
            name: dealer.name,
            address: dealer.address,
            phone: dealer.phone,
            email: dealer.email,
            workingHours: dealer.workingHours,
            mapUrl: 'dealers',
          },
          locations: dealers.map((item) => ({
            id: item.id,
            name: item.name,
            city: item.city,
            address: item.address,
            phone: item.phone,
            workingHours: item.workingHours,
          })),
        };
      case 'estimate_finance': {
        const price = Number(args.price) || 0;
        const downPayment =
          args.downPayment != null
            ? Number(args.downPayment)
            : Math.round(price * 0.1);
        const termMonths = Number(args.termMonths) || 48;
        const product =
          args.product === 'leasing' ? 'leasing' : ('credit' as const);
        const quote = this.financeService.quote({
          product,
          price,
          downPayment,
          termMonths,
        });
        return {
          currency: 'USD',
          product: quote.product,
          price: quote.price,
          downPayment: quote.downPayment,
          termMonths: quote.termMonths,
          aprPercent: quote.annualRatePercent,
          monthlyPayment: quote.monthlyPayment,
          totalPayment: quote.totalPayment,
          overpayment: quote.overpayment,
          calculatorUrl: `finance?price=${Math.round(price)}`,
          disclaimer: this.financeService.getRates().disclaimer,
        };
      }
      case 'escalate_to_manager': {
        const reason = toolArgString(args.reason, 'Customer requested manager');
        const customerName = toolArgString(
          args.customerName,
          'Website chat visitor',
        );
        await this.crmService.sendLeadSafe({
          type: 'contact',
          title: `Chat agent — ${reason.slice(0, 80)}`,
          customerName,
          customerPhone: toolArgString(args.customerPhone) || null,
          customerEmail: toolArgString(args.customerEmail) || null,
          comments: reason,
          sourceDescription: 'website_chat_agent',
        });
        return {
          ok: true,
          nextSteps: `A manager will follow up. Call ${dealer.phone} or leave details at contacts.`,
        };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  private async runOpenAiAgent(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<ChatReply | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return null;

    const model = process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini';
    const messages: OpenAiMessage[] = [
      { role: 'system', content: this.systemPrompt() },
      ...history.slice(-10).map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: 'user', content: message },
    ];

    const toolsUsed: string[] = [];
    const maxSteps = 4;

    for (let step = 0; step < maxSteps; step += 1) {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            temperature: 0.35,
            max_tokens: 500,
            messages,
            tools: AGENT_TOOLS,
            tool_choice: 'auto',
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(
          `OpenAI HTTP ${response.status}: ${errText.slice(0, 240)}`,
        );
        return null;
      }

      const body = (await response.json()) as {
        choices?: Array<{
          message?: OpenAiMessage;
          finish_reason?: string;
        }>;
      };

      const assistantMessage = body.choices?.[0]?.message;
      if (!assistantMessage) return null;

      const toolCalls = assistantMessage.tool_calls ?? [];
      if (toolCalls.length === 0) {
        const reply = assistantMessage.content?.trim();
        if (!reply) return null;
        return {
          reply,
          source: toolsUsed.includes('escalate_to_manager')
            ? 'escalation'
            : 'agent',
          toolsUsed,
          suggestions: QUICK_HINTS.slice(0, 3),
        };
      }

      messages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || '{}') as Record<
            string,
            unknown
          >;
        } catch {
          args = {};
        }
        toolsUsed.push(call.function.name);
        const result = await this.runTool(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      reply:
        'I gathered some information but need a moment — please try rephrasing, or ask a manager via contacts.',
      source: 'agent',
      toolsUsed,
    };
  }

  /** Local tool-using agent when OpenAI key is missing */
  private async runLocalAgent(message: string): Promise<ChatReply> {
    const lower = message.toLowerCase();
    const toolsUsed: string[] = [];

    if (
      /manager|human|operator|call me|speak to|менеджер|оператор/.test(lower)
    ) {
      toolsUsed.push('escalate_to_manager');
      await this.runTool('escalate_to_manager', { reason: message });
      return {
        reply: `I've notified the team. Call ${dealer.phone} or leave a message at contacts and a manager will help.`,
        source: 'escalation',
        toolsUsed,
        suggestions: ['Book a test drive', 'Browse the catalogue'],
      };
    }

    if (/financ|credit|lease|лизинг|кредит|payment|loan|\$\d/.test(lower)) {
      toolsUsed.push('estimate_finance');
      const priceMatch = message.match(/\$?\s*([\d,.]+)\s*(k|000)?/i);
      let price = 25000;
      if (priceMatch) {
        price = Number(priceMatch[1].replace(/,/g, ''));
        if (/k/i.test(priceMatch[2] ?? '') && price < 1000) price *= 1000;
      }
      const estimate = (await this.runTool('estimate_finance', {
        price,
        product: /leas/i.test(lower) ? 'leasing' : 'credit',
      })) as {
        monthlyPayment: number;
        calculatorUrl: string;
        aprPercent: number;
      };
      return {
        reply: `Indicative estimate for $${price.toLocaleString('en-US')}: about $${Math.round(estimate.monthlyPayment).toLocaleString('en-US')} per month at ${estimate.aprPercent}% APR. Open the calculator for details: ${estimate.calculatorUrl}`,
        source: 'agent',
        toolsUsed,
        suggestions: ['Request finance offer', 'Which SUVs do you have?'],
      };
    }

    if (
      /hour|address|phone|dealer|location|контакт|адрес|where are you/.test(
        lower,
      )
    ) {
      toolsUsed.push('get_dealer_info');
      const info = (await this.runTool('get_dealer_info', {})) as {
        primary: {
          name: string;
          address: string;
          phone: string;
          workingHours: string;
          mapUrl: string;
        };
      };
      return {
        reply: `${info.primary.name}\n${info.primary.address}\n${info.primary.phone}\n${info.primary.workingHours}\nMap: ${info.primary.mapUrl}`,
        source: 'agent',
        toolsUsed,
        suggestions: ['Book a test drive', 'Service booking'],
      };
    }

    if (/test.?drive|service|сервис|maintenance|book/.test(lower)) {
      if (/service|сервис|maintenance/.test(lower)) {
        return {
          reply: `You can book service online at service. For questions about warranty or intervals, check faq or ask me another question.`,
          source: 'agent',
          suggestions: ['Dealer hours', 'Contact a manager'],
        };
      }
      return {
        reply: `Book a test drive at test-drive — pick a model and time slot. We will confirm by phone or email.`,
        source: 'agent',
        suggestions: ['Which SUVs do you have?', 'Finance calculator'],
      };
    }

    if (
      /car|model|suv|vitara|jimny|swift|catalog|inventory|price|stock/.test(
        lower,
      )
    ) {
      toolsUsed.push('search_cars');
      const query =
        message.match(/\b(vitara|jimny|swift|s-cross|ignis|across)\b/i)?.[1] ??
        '';
      const cars = (await this.runTool('search_cars', {
        query,
        limit: 5,
      })) as Array<{
        name: string;
        priceUsd: number;
        url: string;
        year: number;
      }>;
      if (cars.length === 0) {
        return {
          reply: `I couldn't find matching stock. Browse all models at catalog or catalog/used.`,
          source: 'agent',
          toolsUsed,
        };
      }
      const lines = cars
        .map(
          (car) =>
            `- ${car.name} (${car.year}) — $${Math.round(car.priceUsd).toLocaleString('en-US')} — ${car.url}`,
        )
        .join('\n');
      return {
        reply: `Here's what I found:\n${lines}\n\nConfigure a model or book a test drive when you're ready.`,
        source: 'agent',
        toolsUsed,
        suggestions: ['Book a test drive', 'Estimate finance for $25,000'],
      };
    }

    toolsUsed.push('search_faq');
    const faq = (await this.runTool('search_faq', {
      query: message,
    })) as Array<{
      question: string;
      answer: string;
    }>;
    if (faq.length > 0) {
      return {
        reply: `${faq[0].answer}\n\nMore answers: faq`,
        source: 'faq',
        toolsUsed,
        suggestions: QUICK_HINTS.slice(0, 3),
      };
    }

    return {
      reply: `I'm the ${dealer.name} assistant. Ask about models, finance (USD), test drives, service, or dealer hours. With OPENAI_API_KEY configured I can reason with live tools even more freely.`,
      source: 'fallback',
      suggestions: QUICK_HINTS,
    };
  }

  async reply(input: ChatMessageDto, clientIp = 'unknown'): Promise<ChatReply> {
    if (!this.rateLimit(clientIp)) {
      return {
        reply: 'Too many messages. Please wait a minute and try again.',
        source: 'fallback',
      };
    }

    const message = input.message.trim();
    if (!message) {
      return { reply: 'Please type a question.', source: 'fallback' };
    }

    try {
      const agentReply = await this.runOpenAiAgent(
        message,
        input.history ?? [],
      );
      if (agentReply) return agentReply;
    } catch (error) {
      this.logger.warn(`Agent loop failed: ${String(error)}`);
    }

    return this.runLocalAgent(message);
  }
}
