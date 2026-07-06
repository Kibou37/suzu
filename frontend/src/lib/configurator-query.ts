import type { ConfigColor } from '@/data/demo-configurator';
import { formatPrice } from '@/lib/format';

export type ConfiguratorSelections = {
  modelSlug: string;
  modelName: string;
  bodyColor?: ConfigColor;
  interiorColor?: ConfigColor;
  options: { id: string; name: string }[];
  totalPrice: number;
};

/** Build query string to pass configuration to test-drive or other pages. */
export function buildConfiguratorQuery(selections: ConfiguratorSelections): string {
  const params = new URLSearchParams();
  params.set('model', selections.modelSlug);

  if (selections.bodyColor) {
    params.set('body', selections.bodyColor.id);
  }
  if (selections.interiorColor) {
    params.set('interior', selections.interiorColor.id);
  }
  if (selections.options.length > 0) {
    params.set('options', selections.options.map((o) => o.id).join(','));
  }

  return params.toString();
}

/** Human-readable summary for mailto body or form notes. */
export function formatConfiguratorSummary(selections: ConfiguratorSelections): string {
  const lines = [
    `Model: Suzuki ${selections.modelName}`,
    selections.bodyColor ? `Exterior: ${selections.bodyColor.name}` : null,
    selections.interiorColor ? `Interior: ${selections.interiorColor.name}` : null,
    selections.options.length > 0
      ? `Options: ${selections.options.map((o) => o.name).join(', ')}`
      : null,
    selections.totalPrice > 0
      ? `Estimated total: ${formatPrice(selections.totalPrice)}`
      : 'Estimated total: on request',
  ];

  return lines.filter(Boolean).join('\n');
}
