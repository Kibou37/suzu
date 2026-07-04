/**
 * Explicit mapping: Suzuki viewer BC_* thumbnail → exterior360 color set id.
 * Source: globalsuzuki.com 360° viewer + car-model-content.raw.json frame sets.
 */
export const EXTERIOR_360_THUMBNAIL_MAP: Record<string, Record<string, string>> = {
  vitara: {
    BC_26U: 'color_3',
    BC_ZCD: 'color_1',
    BC_ZCE: 'color_2',
    BC_ZCF: 'color_10',
    BC_ZNL: 'color_11',
    BC_ZQN: 'color_12',
    BC_A9G_R: 'color_5',
    BC_A9H_R: 'color_8',
    BC_A9L_R: 'color_6',
    BC_A9N_R: 'color_7',
    BC_DBH_R: 'color_0',
    BC_DBG_R: 'color_4',
    BC_DBF_R: 'color_9',
    // BC_ZCC, BC_A6H_R — no local 360 set; use Suzuki CDN via materialKey
  },
  jimny: {
    BC_DG52_R: 'color_0',
    BC_2BW2_R: 'color_1',
    BC_CZW2_R: 'color_2',
    BC_26U: 'color_3',
    BC_ZZC: 'color_4',
    BC_Z2S: 'color_5',
    BC_ZVL: 'color_6',
    BC_ZJ3: 'color_7',
  },
};

/** Models that support Suzuki CDN or iframe 360 when local frames are missing. */
export const SUZUKI_360_MODELS = new Set(['vitara', 'jimny', 'swift', 's-cross']);

export function has360Support(modelSlug: string): boolean {
  return SUZUKI_360_MODELS.has(modelSlug);
}
