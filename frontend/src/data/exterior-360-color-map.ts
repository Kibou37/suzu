/**
 * Explicit mapping: Suzuki viewer BC_* thumbnail → exterior360 color set id.
 *
 * color_* ids come from frontend/src/data/car-model-content.raw.json (perxis.ru).
 * BC_* codes come from suzuki-viewer-catalog.ts (globalsuzuki.com viewer).
 *
 * Vitara raw-JSON names cross-referenced with catalog names:
 *   color_0  Solar Yellow Pearl / Black Roof     → BC_DBH_R
 *   color_1  Galactic Gray Metallic              → BC_ZCD
 *   color_2  Cosmic Black Pearl Metallic         → BC_ZCE
 *   color_3  White                               → BC_26U
 *   color_4  Solar Yellow Pearl / White Roof     → BC_DBG_R
 *   color_5  Galactic Grey / Black Roof          → BC_A9G_R
 *   color_6  Atlantis Turquoise Pearl / Black Roof → BC_A9L_R
 *   color_7  Savannah Ivory Pearl / Black Roof   → BC_A9N_R
 *   color_8  Bright Red / Black Roof             → BC_A9H_R
 *   color_9  Ice Greyish Blue / Black Roof       → BC_DBF_R
 *   color_10 Bright Red                          → BC_ZCF
 *   color_11 Cool White Pearl Metallic           → BC_ZNL
 *   color_12 Atlantis Turquoise Pearl Metallic   → BC_ZQN
 *
 * Jimny raw-JSON names:
 *   color_0  Kinetic Yellow + Bluish Black Pearl     → BC_DG52_R
 *   color_1  Chiffon Ivory Metallic + Bluish Black   → BC_2BW2_R
 *   color_2  Brisk Blue Metallic + Bluish Black       → BC_CZW2_R
 *   color_3  White                                    → BC_26U  (jimny)
 *   color_4  Jungle Green                             → BC_ZZC
 *   color_5  Silky Silver Metallic                    → BC_Z2S
 *   color_6  Medium Gray                              → BC_ZVL
 *   color_7  Bluish Black Pearl                       → BC_ZJ3
 */
export const EXTERIOR_360_THUMBNAIL_MAP: Record<string, Record<string, string>> = {
  vitara: {
    BC_DBH_R: 'color_0', // Solar Yellow Pearl / Black Roof
    BC_ZCD:   'color_1', // Galactic Gray Metallic
    BC_ZCE:   'color_2', // Cosmic Black Pearl Metallic
    BC_26U:   'color_3', // White
    BC_DBG_R: 'color_4', // Solar Yellow Pearl / White Roof
    BC_A9G_R: 'color_5', // Galactic Grey / Black Roof
    BC_A9L_R: 'color_6', // Atlantis Turquoise Pearl / Black Roof
    BC_A9N_R: 'color_7', // Savannah Ivory Pearl / Black Roof
    BC_A9H_R: 'color_8', // Bright Red / Black Roof
    BC_DBF_R: 'color_9', // Ice Greyish Blue / Black Roof
    BC_ZCF:   'color_10', // Bright Red
    BC_ZNL:   'color_11', // Cool White Pearl Metallic
    BC_ZQN:   'color_12', // Atlantis Turquoise Pearl Metallic
    // BC_ZCC (Silky Silver), BC_A6H_R — no perxis frames; will use iframe fallback
  },
  jimny: {
    BC_DG52_R: 'color_0', // Kinetic Yellow + Bluish Black Pearl
    BC_2BW2_R: 'color_1', // Chiffon Ivory Metallic + Bluish Black
    BC_CZW2_R: 'color_2', // Brisk Blue Metallic + Bluish Black
    BC_26U:    'color_3', // White
    BC_ZZC:    'color_4', // Jungle Green
    BC_Z2S:    'color_5', // Silky Silver Metallic
    BC_ZVL:    'color_6', // Medium Gray
    BC_ZJ3:    'color_7', // Bluish Black Pearl
  },
};

/**
 * Representative hex for each BC_* thumbnail.
 * Used as the fallback colour when the swatch PNG is unavailable or fails to load.
 * For two-tone colours the more distinctive body colour is used.
 * Hex values are extracted from the "hexes" field in car-model-content.raw.json.
 */
export const BODY_COLOR_HEX_MAP: Record<string, Record<string, string>> = {
  vitara: {
    BC_DBH_R: '#9b6c2a', // Solar Yellow Pearl / Black Roof
    BC_ZCC:   '#c2c2c2', // Silky Silver Metallic
    BC_ZCD:   '#5d5d5d', // Galactic Gray Metallic
    BC_ZCE:   '#292929', // Cosmic Black Pearl Metallic
    BC_26U:   '#d2d2d2', // White
    BC_DBG_R: '#9a6b29', // Solar Yellow Pearl / White Roof
    BC_A9G_R: '#626264', // Galactic Grey / Black Roof
    BC_A9L_R: '#006e81', // Atlantis Turquoise Pearl / Black Roof
    BC_A9N_R: '#8f8376', // Savannah Ivory Pearl / Black Roof
    BC_A9H_R: '#d73a4a', // Bright Red / Black Roof
    BC_DBF_R: '#5d6d72', // Ice Greyish Blue / Black Roof
    BC_ZCF:   '#ba241d', // Bright Red
    BC_ZNL:   '#a3a3a3', // Cool White Pearl Metallic
    BC_ZQN:   '#007081', // Atlantis Turquoise Pearl Metallic
    BC_A6H_R: '#007081', // Atlantis Turquoise Pearl Metallic + White
  },
  jimny: {
    BC_DG52_R: '#a2ac31', // Kinetic Yellow + Bluish Black Pearl
    BC_CZW2_R: '#2c72a3', // Brisk Blue Metallic + Bluish Black Pearl
    BC_2BW2_R: '#c3b689', // Chiffon Ivory Metallic + Bluish Black Pearl
    BC_ZZC:    '#3e4537', // Jungle Green
    BC_ZJ3:    '#242426', // Bluish Black Pearl
    BC_ZVL:    '#585656', // Medium Gray
    BC_Z2S:    '#8b8b8b', // Silky Silver Metallic
    BC_26U:    '#d2d2d2', // White
  },
  swift: {
    BC_E6L:    '#2870a0', // Frontier Blue Pearl Metallic × Super Black Pearl
    BC_D7Z:    '#c03040', // Burning Red Pearl Metallic × Super Black Pearl
    BC_E6P:    '#c8b84a', // Cool Yellow Metallic × Mineral Gray Metallic
    BC_DYH:    '#d5d5d5', // Pure White Pearl × Mineral Gray Metallic
    BC_WB1_R:  '#2870a0', // Frontier Blue Pearl Metallic
    BC_WB2_R:  '#c8b84a', // Cool Yellow Metallic
    BC_ZWP_R:  '#c03040', // Burning Red Pearl Metallic
    BC_ZWD_R:  '#e07840', // Flame Orange Pearl Metallic
    BC_ZYL_R:  '#cfc0a8', // Caravan Ivory Pearl Metallic
    BC_ZVR_R:  '#d5d5d5', // Pure White Pearl
    BC_ZNC_R:  '#8b8b8b', // Premium Silver Metallic
    BC_ZMW_R:  '#666870', // Mineral Gray Metallic
    BC_ZMV_R:  '#1c1c1e', // Super Black Pearl
  },
  's-cross': {
    BC_ZNL:  '#a3a3a3', // Cool White Pearl
    BC_ZCC:  '#c2c2c2', // Silky Silver Metallic
    BC_ZCE:  '#292929', // Cosmic Black Pearl Metallic
    BC_ZQ5:  '#c03040', // Energetic Red Pearl
    BC_ZQ3:  '#8b6752', // Canyon Brown Pearl Metallic
    BC_ZQ4:  '#3864a0', // Sphere Blue Pearl
    BC_26U:  '#d2d2d2', // White
  },
};

/** Models that support Suzuki iframe 360 when local frames are missing. */
export const SUZUKI_360_MODELS = new Set(['vitara', 'jimny', 'swift', 's-cross']);

export function has360Support(modelSlug: string): boolean {
  return SUZUKI_360_MODELS.has(modelSlug);
}
