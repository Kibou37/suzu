import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { getClientIp } from '../common/rate-limiter.util';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('quick-replies')
  quickReplies() {
    return {
      items: this.chatService.getQuickReplies(),
      agentEnabled: this.chatService.isAgentConfigured(),
    };
  }

  @Post()
  async chat(@Body() body: ChatMessageDto, @Req() req: Request) {
    return this.chatService.reply(body, getClientIp(req));
  }
}
