import { getSuzukiViewerData } from './suzuki-viewer-catalog';

export type ConfigColor = {
  id: string;
  name: string;
  /** Official Suzuki 360° viewer thumbnail id (e.g. BC_26U). */
  thumbnail?: string;
  /** Material folder key for Suzuki CDN 360 frames (e.g. EXT-GRD_GLX-BG_A-BC_26U). */
  materialKey?: string;
  /** Local swatch image extracted from globalsuzuki.com viewer. */
  swatch?: string;
  /** Fallback when swatch image is unavailable. */
  hex?: string;
  /** Second tone for two-tone paint finishes. */
  hexSecondary?: string;
  price: number;
};

export type ConfigOption = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
};

export type ConfiguratorData = {
  bodyColors: ConfigColor[];
  interiorColors: ConfigColor[];
  options: ConfigOption[];
};

const EMPTY: ConfiguratorData = {
  bodyColors: [],
  interiorColors: [],
  options: [],
};

/**
 * Options like `r-001` / `r-002` are variants of one choice group.
 * Selecting one must replace the other.
 */
export function getOptionGroupKey(optionId: string): string {
  const match = optionId.match(/^(.*)-\d+$/);
  return match?.[1] ?? optionId;
}

/** "Door mirror cover (Red)" → "door mirror cover" */
export function getOptionBaseName(name: string): string {
  return name
    .replace(/\s*[（(][^）)]*[）)]\s*$/u, '')
    .trim()
    .toLowerCase();
}

function optionConflictsWith(
  candidate: ConfigOption,
  selected: ConfigOption,
): boolean {
  if (candidate.id === selected.id) return false;
  return (
    getOptionGroupKey(candidate.id) === getOptionGroupKey(selected.id) ||
    getOptionBaseName(candidate.name) === getOptionBaseName(selected.name)
  );
}

/**
 * Keep at most one selected option per exclusive family.
 * Families are matched by id prefix (`mirror-002`) and by base name
 * (`Door mirror cover (Red)` / `Door mirror cover (Carbon fiber look)`),
 * because Suzuki ids for the same choice are not always consistent.
 */
export function normalizeSelectedOptionIds(
  optionIds: string[],
  catalogOptions: ConfigOption[],
): string[] {
  const byId = new Map(catalogOptions.map((option) => [option.id, option]));
  const kept: ConfigOption[] = [];

  for (const id of optionIds) {
    const option = byId.get(id);
    if (!option) continue;

    const next = kept.filter((existing) => !optionConflictsWith(existing, option));
    next.push(option);
    kept.length = 0;
    kept.push(...next);
  }

  return kept.map((option) => option.id);
}

export function toggleExclusiveOption(
  currentIds: string[],
  optionId: string,
  catalogOptions: ConfigOption[],
): string[] {
  if (currentIds.includes(optionId)) {
    return currentIds.filter((id) => id !== optionId);
  }

  const selected = catalogOptions.find((option) => option.id === optionId);
  if (!selected) {
    return [...currentIds, optionId];
  }

  const byId = new Map(catalogOptions.map((option) => [option.id, option]));

  return [
    ...currentIds.filter((id) => {
      const existing = byId.get(id);
      return !existing || !optionConflictsWith(existing, selected);
    }),
    optionId,
  ];
}

/** Model-specific colours and options from Global Suzuki 360° viewer data. */
export function getConfiguratorData(modelSlug: string): ConfiguratorData {
  return getSuzukiViewerData(modelSlug) ?? EMPTY;
}

export function calculateConfiguratorTotal(
  basePrice: number,
  bodyColor: ConfigColor | undefined,
  interiorColor: ConfigColor | undefined,
  selectedOptions: ConfigOption[],
): number {
  const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
  return basePrice + (bodyColor?.price ?? 0) + (interiorColor?.price ?? 0) + optionsTotal;
}
