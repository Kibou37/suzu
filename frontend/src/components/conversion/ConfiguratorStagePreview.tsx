'use client';

import type { ConfigColor } from '@/data/demo-configurator';
import { ConfiguratorExterior360 } from '@/components/conversion/ConfiguratorExterior360';
import { ConfiguratorInteriorPanorama } from '@/components/conversion/ConfiguratorInteriorPanorama';
import { getInteriorPanorama } from '@/lib/car-interior-panorama';

type ConfiguratorStagePreviewProps = {
  modelSlug: string;
  modelName: string;
  step: number;
  bodyColor?: ConfigColor;
};

export function ConfiguratorStagePreview({
  modelSlug,
  modelName,
  step,
  bodyColor,
}: ConfiguratorStagePreviewProps) {
  const interiorPanorama = getInteriorPanorama(modelSlug);
  const showInterior = step === 2 && Boolean(interiorPanorama);

  if (showInterior && interiorPanorama) {
    return (
      <ConfiguratorInteriorPanorama modelName={modelName} panorama={interiorPanorama} />
    );
  }

  return (
    <ConfiguratorExterior360
      modelSlug={modelSlug}
      modelName={modelName}
      bodyColor={bodyColor}
    />
  );
}
