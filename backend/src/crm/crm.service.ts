import { Injectable, Logger } from '@nestjs/common';

export type CrmLeadType =
  | 'test_drive'
  | 'service'
  | 'quote'
  | 'configuration_saved'
  | 'contact';

export type CrmLeadPayload = {
  type: CrmLeadType;
  title: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  comments?: string | null;
  sourceDescription?: string | null;
  /** Extra key/values appended to COMMENTS */
  fields?: Record<string, string | number | null | undefined>;
};

/** @deprecated use CrmLeadPayload with type configuration_saved */
export type CrmConfigurationPayload = {
  event: 'configuration_saved';
  configurationId: string;
  userId: string;
  carSlug: string;
  modelName: string;
  totalPrice: number;
  summary: string;
  snapshot: Record<string, unknown>;
};

function resolveWebhookUrl(): string | undefined {
  return (
    process.env.BITRIX24_WEBHOOK_URL?.trim() ||
    process.env.CRM_WEBHOOK_URL?.trim() ||
    undefined
  );
}

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  async sendLead(payload: CrmLeadPayload): Promise<boolean> {
    const webhookUrl = resolveWebhookUrl();

    if (!webhookUrl) {
      this.logger.debug(
        `CRM lead skipped (${payload.type}): BITRIX24_WEBHOOK_URL not set`,
      );
      return false;
    }

    const base = webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`;
    const endpoint = `${base}crm.lead.add.json`;

    const commentLines = [
      payload.comments?.trim() || null,
      payload.sourceDescription ? `Source: ${payload.sourceDescription}` : null,
      ...Object.entries(payload.fields ?? {})
        .filter(([, value]) => value != null && String(value).trim() !== '')
        .map(([key, value]) => `${key}: ${value}`),
    ].filter(Boolean);

    const fields: Record<string, unknown> = {
      TITLE: payload.title,
      NAME: payload.customerName,
      SOURCE_DESCRIPTION:
        payload.sourceDescription ?? `website_${payload.type}`,
      COMMENTS: commentLines.join('\n'),
    };

    if (payload.customerPhone?.trim()) {
      fields.PHONE = [
        { VALUE: payload.customerPhone.trim(), VALUE_TYPE: 'WORK' },
      ];
    }

    if (payload.customerEmail?.trim()) {
      fields.EMAIL = [
        { VALUE: payload.customerEmail.trim(), VALUE_TYPE: 'WORK' },
      ];
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        this.logger.warn(
          `CRM lead failed (${payload.type}): HTTP ${response.status}`,
        );
        return false;
      }

      const body = (await response.json()) as {
        result?: number;
        error?: string;
      };
      if (body.error) {
        this.logger.warn(`CRM lead rejected (${payload.type}): ${body.error}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.warn(`CRM lead error (${payload.type}): ${String(error)}`);
      return false;
    }
  }

  async sendLeadSafe(payload: CrmLeadPayload): Promise<void> {
    try {
      await this.sendLead(payload);
    } catch (error) {
      this.logger.error(`CRM lead unexpected error (${payload.type})`, error);
    }
  }

  /** @deprecated prefer sendLead with type configuration_saved */
  async sendConfigurationSaved(
    payload: CrmConfigurationPayload,
  ): Promise<boolean> {
    return this.sendLead({
      type: 'configuration_saved',
      title: `Configuration — Suzuki ${payload.modelName}`,
      customerName: `User ${payload.userId}`,
      comments: payload.summary,
      sourceDescription: 'website_configuration',
      fields: {
        configurationId: payload.configurationId,
        carSlug: payload.carSlug,
        totalPrice: payload.totalPrice,
      },
    });
  }
}
