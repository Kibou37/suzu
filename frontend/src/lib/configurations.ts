import { authHeaders, getAuthToken } from '@/lib/auth';
import type { ConfiguratorSelections } from '@/lib/configurator-query';
import { formatConfiguratorSummary } from '@/lib/configurator-query';
import { apiUrl, isDemoDataMode, parseApiError, STORAGE_KEYS } from '@/lib/config';

export type SavedConfiguration = {
  id: string;
  carSlug: string;
  modelName: string;
  trim: string | null;
  bodyColorId: string | null;
  interiorColorId: string | null;
  selectedOptions: string[];
  snapshot: Record<string, unknown>;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type SaveConfigurationPayload = ConfiguratorSelections;

const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000;
const CONFIGURATION_TTL_MS = 5 * 24 * 60 * 60 * 1000;

export { AUTO_SAVE_INTERVAL_MS };

function configuratorSessionKey(userId: string, modelSlug: string): string {
  return `${STORAGE_KEYS.configuratorSessionPrefix}:${userId}:${modelSlug}`;
}

export function getConfiguratorSessionId(userId: string, modelSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(configuratorSessionKey(userId, modelSlug));
}

export function setConfiguratorSessionId(
  userId: string,
  modelSlug: string,
  configurationId: string,
): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(configuratorSessionKey(userId, modelSlug), configurationId);
}

export function clearConfiguratorSessionId(userId: string, modelSlug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(configuratorSessionKey(userId, modelSlug));
}

function readDemoConfigurations(userId: string): SavedConfiguration[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.demoConfigurations);
    const all = raw ? (JSON.parse(raw) as Record<string, SavedConfiguration[]>) : {};
    const items = all[userId] ?? [];
    const cutoff = Date.now() - CONFIGURATION_TTL_MS;
    const fresh = items.filter((item) => new Date(item.updatedAt).getTime() >= cutoff);

    if (fresh.length !== items.length) {
      writeDemoConfigurations(userId, fresh);
    }

    return fresh;
  } catch {
    return [];
  }
}

function writeDemoConfigurations(userId: string, items: SavedConfiguration[]): void {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(STORAGE_KEYS.demoConfigurations);
  const all = raw ? (JSON.parse(raw) as Record<string, SavedConfiguration[]>) : {};
  all[userId] = items;
  localStorage.setItem(STORAGE_KEYS.demoConfigurations, JSON.stringify(all));
}

function buildPayload(
  selections: SaveConfigurationPayload,
  configurationId?: string | null,
) {
  const summary = formatConfiguratorSummary(selections);

  return {
    configurationId: configurationId ?? undefined,
    carSlug: selections.modelSlug,
    bodyColorId: selections.bodyColor?.id,
    interiorColorId: selections.interiorColor?.id,
    selectedOptionIds: selections.options.map((option) => option.id),
    totalPrice: selections.totalPrice,
    summary,
    snapshot: {
      modelName: selections.modelName,
      bodyColorName: selections.bodyColor?.name ?? null,
      interiorColorName: selections.interiorColor?.name ?? null,
      optionNames: selections.options.map((option) => option.name),
    },
  };
}

function normalizeConfiguration(
  data: SavedConfiguration & { selectedOptions?: unknown },
  fallbackOptionIds: string[] = [],
): SavedConfiguration {
  return {
    ...data,
    selectedOptions: Array.isArray(data.selectedOptions)
      ? (data.selectedOptions as string[])
      : fallbackOptionIds,
  };
}

function upsertDemoConfiguration(
  userId: string,
  selections: SaveConfigurationPayload,
  existingId?: string | null,
): SavedConfiguration {
  const payload = buildPayload(selections, existingId);
  const items = readDemoConfigurations(userId);
  const now = new Date().toISOString();
  const existing = existingId ? items.find((item) => item.id === existingId) : undefined;

  const saved: SavedConfiguration = {
    id: existing?.id ?? `demo-config-${Date.now()}`,
    carSlug: selections.modelSlug,
    modelName: selections.modelName,
    trim: existing?.trim ?? null,
    bodyColorId: selections.bodyColor?.id ?? null,
    interiorColorId: selections.interiorColor?.id ?? null,
    selectedOptions: payload.selectedOptionIds,
    snapshot: payload.snapshot,
    totalPrice: selections.totalPrice,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const nextItems = existing
    ? items.map((item) => (item.id === existing.id ? saved : item))
    : [saved, ...items];

  writeDemoConfigurations(userId, nextItems);
  return saved;
}

/** Save or overwrite the configuration for the current configurator session. */
export async function saveSessionConfiguration(
  configurationId: string | null,
  selections: SaveConfigurationPayload,
  userId: string,
): Promise<SavedConfiguration> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Sign in to save your configuration');
  }

  const payload = buildPayload(selections, configurationId);

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    if (!sessionId) {
      throw new Error('Session expired');
    }

    const saved = upsertDemoConfiguration(sessionId, selections, configurationId);
    setConfiguratorSessionId(userId, selections.modelSlug, saved.id);
    return saved;
  }

  const res = await fetch(apiUrl('/api/configurations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Unable to save configuration'));
  }

  const data = (await res.json()) as SavedConfiguration & { selectedOptions?: unknown };
  const saved = normalizeConfiguration(data, payload.selectedOptionIds);
  setConfiguratorSessionId(userId, selections.modelSlug, saved.id);
  return saved;
}

export async function fetchConfiguration(configurationId: string): Promise<SavedConfiguration> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Sign in to load your configuration');
  }

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    if (!sessionId) {
      throw new Error('Session expired');
    }

    const item = readDemoConfigurations(sessionId).find((entry) => entry.id === configurationId);
    if (!item) {
      throw new Error('Configuration not found');
    }

    return item;
  }

  const res = await fetch(apiUrl(`/api/configurations/${configurationId}`), {
    headers: authHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Unable to load configuration');
  }

  const data = (await res.json()) as SavedConfiguration & { selectedOptions?: unknown };
  return normalizeConfiguration(data);
}

/**
 * Fetches the most recent saved configuration for the given car model.
 * Returns null if the user has no saved configuration for this model.
 */
export async function fetchLatestConfiguration(modelSlug: string): Promise<SavedConfiguration | null> {
  const token = getAuthToken();
  if (!token) return null;

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    if (!sessionId) return null;

    const items = readDemoConfigurations(sessionId).filter((item) => item.carSlug === modelSlug);
    if (items.length === 0) return null;

    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return items[0];
  }

  const res = await fetch(apiUrl(`/api/configurations/current?carSlug=${encodeURIComponent(modelSlug)}`), {
    headers: authHeaders(),
    cache: 'no-store',
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const data = (await res.json()) as SavedConfiguration & { selectedOptions?: unknown };
  return normalizeConfiguration(data);
}

export async function fetchMyConfigurations(): Promise<SavedConfiguration[]> {
  const token = getAuthToken();
  if (!token) return [];

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    return sessionId ? readDemoConfigurations(sessionId) : [];
  }

  const res = await fetch(apiUrl('/api/configurations'), {
    headers: authHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Unable to load saved configurations');
  }

  const items = (await res.json()) as Array<
    SavedConfiguration & { selectedOptions?: unknown }
  >;

  return items.map((item) => normalizeConfiguration(item));
}

export async function deleteConfiguration(
  configurationId: string,
  userId: string,
  modelSlug?: string,
): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Sign in to manage configurations');
  }

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    if (!sessionId) {
      throw new Error('Session expired');
    }

    const items = readDemoConfigurations(sessionId).filter((item) => item.id !== configurationId);
    writeDemoConfigurations(sessionId, items);
  } else {
    const res = await fetch(apiUrl('/api/configurations/delete'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ id: configurationId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(parseApiError(text, 'Unable to delete configuration'));
    }
  }

  if (modelSlug) {
    const sessionConfigId = getConfiguratorSessionId(userId, modelSlug);
    if (sessionConfigId === configurationId) {
      clearConfiguratorSessionId(userId, modelSlug);
    }
  }
}

export function buildTestDriveHref(
  selections: SaveConfigurationPayload,
  configurationId?: string,
): string {
  const params = new URLSearchParams();
  params.set('model', selections.modelSlug);
  if (selections.bodyColor) params.set('body', selections.bodyColor.id);
  if (selections.interiorColor) params.set('interior', selections.interiorColor.id);
  if (selections.options.length > 0) {
    params.set('options', selections.options.map((option) => option.id).join(','));
  }
  if (configurationId) params.set('configId', configurationId);
  return `/test-drive?${params.toString()}`;
}
