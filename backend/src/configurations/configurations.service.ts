import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CrmService } from '../crm/crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

/** Saved configurations expire after this many days without updates. */
export const CONFIGURATION_TTL_DAYS = 5;

const PURGE_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class ConfigurationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConfigurationsService.name);
  private purgeTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crmService: CrmService,
  ) {}

  onModuleInit() {
    void this.purgeExpiredConfigurations();
    this.purgeTimer = setInterval(() => {
      void this.purgeExpiredConfigurations();
    }, PURGE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.purgeTimer) {
      clearInterval(this.purgeTimer);
      this.purgeTimer = null;
    }
  }

  private ttlCutoff(): Date {
    return new Date(Date.now() - CONFIGURATION_TTL_DAYS * 24 * 60 * 60 * 1000);
  }

  private isExpired(updatedAt: Date): boolean {
    return updatedAt.getTime() < this.ttlCutoff().getTime();
  }

  /** Deletes configurations that were not updated within the TTL window. */
  async purgeExpiredConfigurations(): Promise<number> {
    const result = await this.prisma.configuration.deleteMany({
      where: {
        updatedAt: { lt: this.ttlCutoff() },
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Purged ${result.count} configuration(s) older than ${CONFIGURATION_TTL_DAYS} days`,
      );
    }

    return result.count;
  }

  async create(userId: string, input: CreateConfigurationDto) {
    void this.purgeExpiredConfigurations();

    if (input.configurationId) {
      try {
        return await this.update(userId, input.configurationId, {
          bodyColorId: input.bodyColorId,
          interiorColorId: input.interiorColorId,
          selectedOptionIds: input.selectedOptionIds,
          totalPrice: input.totalPrice,
          summary: input.summary,
          snapshot: input.snapshot,
        });
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    const car = await this.prisma.car.findUnique({
      where: { slug: input.carSlug },
      include: {
        variants: { orderBy: { basePrice: 'asc' }, take: 1 },
      },
    });

    if (!car || car.variants.length === 0) {
      throw new BadRequestException('Selected model was not found');
    }

    const variant = car.variants[0];
    const selectedOptions = input.selectedOptionIds ?? [];
    const snapshot = {
      carSlug: car.slug,
      modelName: car.name,
      trim: car.trim,
      bodyColorId: input.bodyColorId ?? null,
      interiorColorId: input.interiorColorId ?? null,
      selectedOptionIds: selectedOptions,
      summary: input.summary ?? null,
      ...(input.snapshot ?? {}),
    };

    const configuration = await this.prisma.configuration.create({
      data: {
        userId,
        variantId: variant.id,
        bodyColorId: input.bodyColorId ?? null,
        interiorColorId: input.interiorColorId ?? null,
        selectedOptions,
        snapshot,
        totalPrice: input.totalPrice,
      },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    void this.crmService.sendLeadSafe({
      type: 'configuration_saved',
      title: `Configuration — Suzuki ${car.name}`,
      customerName: `User ${userId}`,
      comments: input.summary ?? '',
      sourceDescription: 'website_configuration',
      fields: {
        configurationId: configuration.id,
        carSlug: car.slug,
        totalPrice: Number(configuration.totalPrice),
      },
    });

    return this.toResponse(configuration);
  }

  async remove(userId: string, id: string) {
    const configuration = await this.prisma.configuration.findUnique({
      where: { id },
    });

    if (!configuration) {
      throw new NotFoundException('Configuration not found');
    }

    if (configuration.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this configuration',
      );
    }

    await this.prisma.configuration.delete({ where: { id } });

    return { deleted: true };
  }

  async listForUser(userId: string) {
    await this.purgeExpiredConfigurations();

    const items = await this.prisma.configuration.findMany({
      where: {
        userId,
        updatedAt: { gte: this.ttlCutoff() },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    return items.map((item) => this.toResponse(item));
  }

  async getCurrentForUser(userId: string, carSlug: string) {
    await this.purgeExpiredConfigurations();

    const car = await this.prisma.car.findUnique({
      where: { slug: carSlug },
    });

    if (!car) {
      throw new NotFoundException('Selected model was not found');
    }

    const configuration = await this.prisma.configuration.findFirst({
      where: {
        userId,
        variant: { carId: car.id },
        updatedAt: { gte: this.ttlCutoff() },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    if (!configuration) {
      throw new NotFoundException('No saved configuration for this model');
    }

    return this.toResponse(configuration);
  }

  async update(userId: string, id: string, input: UpdateConfigurationDto) {
    const existing = await this.prisma.configuration.findUnique({
      where: { id },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Configuration not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this configuration',
      );
    }

    if (this.isExpired(existing.updatedAt)) {
      await this.prisma.configuration.delete({ where: { id } });
      throw new NotFoundException('Configuration not found');
    }

    const previousSnapshot =
      typeof existing.snapshot === 'object' && existing.snapshot !== null
        ? (existing.snapshot as Record<string, unknown>)
        : {};

    const selectedOptions =
      input.selectedOptionIds ?? (existing.selectedOptions as string[]);

    const snapshot = {
      ...previousSnapshot,
      bodyColorId:
        input.bodyColorId !== undefined
          ? input.bodyColorId
          : existing.bodyColorId,
      interiorColorId:
        input.interiorColorId !== undefined
          ? input.interiorColorId
          : existing.interiorColorId,
      selectedOptionIds: selectedOptions,
      summary: input.summary ?? previousSnapshot.summary ?? null,
      ...(input.snapshot ?? {}),
    };

    const configuration = await this.prisma.configuration.update({
      where: { id },
      data: {
        bodyColorId:
          input.bodyColorId !== undefined
            ? input.bodyColorId
            : existing.bodyColorId,
        interiorColorId:
          input.interiorColorId !== undefined
            ? input.interiorColorId
            : existing.interiorColorId,
        selectedOptions,
        snapshot,
        ...(input.totalPrice !== undefined
          ? { totalPrice: input.totalPrice }
          : {}),
      },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    return this.toResponse(configuration);
  }

  async getForUser(userId: string, id: string) {
    const configuration = await this.prisma.configuration.findUnique({
      where: { id },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true, trim: true } } },
        },
      },
    });

    if (!configuration) {
      throw new NotFoundException('Configuration not found');
    }

    if (configuration.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this configuration',
      );
    }

    if (this.isExpired(configuration.updatedAt)) {
      await this.prisma.configuration.delete({ where: { id } });
      throw new NotFoundException('Configuration not found');
    }

    return this.toResponse(configuration);
  }

  async resendToCrm(userId: string, id: string) {
    const configuration = await this.prisma.configuration.findUnique({
      where: { id },
      include: {
        variant: {
          include: { car: { select: { slug: true, name: true } } },
        },
      },
    });

    if (!configuration) {
      throw new NotFoundException('Configuration not found');
    }

    if (configuration.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this configuration',
      );
    }

    const snapshot =
      typeof configuration.snapshot === 'object' &&
      configuration.snapshot !== null
        ? (configuration.snapshot as Record<string, unknown>)
        : {};

    const sent = await this.crmService.sendLead({
      type: 'configuration_saved',
      title: `Configuration — Suzuki ${configuration.variant.car.name}`,
      customerName: `User ${userId}`,
      comments: typeof snapshot.summary === 'string' ? snapshot.summary : '',
      sourceDescription: 'website_configuration',
      fields: {
        configurationId: configuration.id,
        carSlug: configuration.variant.car.slug,
        totalPrice: Number(configuration.totalPrice),
      },
    });

    return { sent };
  }

  private toResponse(configuration: {
    id: string;
    bodyColorId: string | null;
    interiorColorId: string | null;
    selectedOptions: unknown;
    snapshot: unknown;
    totalPrice: { toString(): string } | number | string;
    createdAt: Date;
    updatedAt: Date;
    variant: {
      car: { slug: string; name: string; trim: string | null };
    };
  }) {
    return {
      id: configuration.id,
      carSlug: configuration.variant.car.slug,
      modelName: configuration.variant.car.name,
      trim: configuration.variant.car.trim,
      bodyColorId: configuration.bodyColorId,
      interiorColorId: configuration.interiorColorId,
      selectedOptions: configuration.selectedOptions,
      snapshot: configuration.snapshot,
      totalPrice: Number(configuration.totalPrice),
      createdAt: configuration.createdAt.toISOString(),
      updatedAt: configuration.updatedAt.toISOString(),
    };
  }
}
