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
