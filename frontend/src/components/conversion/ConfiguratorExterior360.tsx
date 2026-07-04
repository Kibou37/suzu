'use client';

import { preload } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConfigColor } from '@/data/demo-configurator';
import {
  getSuzukiViewerIframeUrl,
  resolveExterior360Frames,
} from '@/lib/car-exterior-360';

type ConfiguratorExterior360Props = {
  modelSlug: string;
  modelName: string;
  bodyColor?: ConfigColor;
};

const DRAG_PIXELS_PER_FRAME = 14;

type ViewMode = 'loading' | 'spin' | 'iframe' | 'empty';

type Exterior360ViewProps = {
  modelSlug: string;
  modelName: string;
  bodyColor?: ConfigColor;
  localFrames: string[] | undefined;
  iframeUrl: string | undefined;
};

function Exterior360View({
  modelName,
  bodyColor,
  localFrames,
  iframeUrl,
}: Exterior360ViewProps) {
  const dragRef = useRef({ active: false, startX: 0 });
  const [frameIndex, setFrameIndex] = useState(0);
  const [spinReady, setSpinReady] = useState(false);
  const [mode, setMode] = useState<ViewMode>(() =>
    localFrames?.length ? 'loading' : iframeUrl ? 'iframe' : 'empty',
  );

  useEffect(() => {
    if (!localFrames?.length) return;

    preload(localFrames[0], { as: 'image' });

    const img = document.createElement('img');
    img.onload = () => {
      setSpinReady(true);
      setMode('spin');
    };
    img.onerror = () => {
      setSpinReady(true);
      setMode(iframeUrl ? 'iframe' : 'empty');
    };
    img.src = localFrames[0];

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [iframeUrl, localFrames]);

  const currentFrameUrl = useMemo(() => {
    if (mode !== 'spin' || !localFrames?.length) return null;
    const index = ((frameIndex % localFrames.length) + localFrames.length) % localFrames.length;
    return localFrames[index] ?? null;
  }, [frameIndex, localFrames, mode]);

  const updateFrameFromDelta = useCallback(
    (deltaX: number) => {
      const step = Math.round(deltaX / DRAG_PIXELS_PER_FRAME);
      if (step === 0 || !localFrames?.length) return;

      setFrameIndex((current) => (current - step + localFrames.length * 16) % localFrames.length);
    },
    [localFrames],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== 'spin') return;
    dragRef.current = { active: true, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    updateFrameFromDelta(event.clientX - dragRef.current.startX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const colorLabel = bodyColor?.name ?? '';
  const showLoader = mode === 'loading' || (mode === 'spin' && !spinReady);

  return (
    <div
      className={`configurator-360${showLoader ? ' configurator-360--loading' : ''}${mode === 'spin' ? ' configurator-360--spin' : ''}`}
    >
      {showLoader && (
        <div className="configurator-360__placeholder" aria-hidden="true">
          <div className="configurator-360__loader" />
        </div>
      )}

      {mode === 'spin' && spinReady && currentFrameUrl && (
        <>
          <div
            className="configurator-360__spin"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label={`360 degree view of Suzuki ${modelName}${colorLabel ? ` in ${colorLabel}` : ''}. Drag horizontally to rotate.`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external 360 frame sequence */}
            <img
              src={currentFrameUrl}
              alt=""
              className="configurator-360__frame"
              draggable={false}
            />
          </div>
          <p className="configurator-360__hint">Drag to rotate · 360° exterior</p>
        </>
      )}

      {mode === 'iframe' && iframeUrl && (
        <>
          <iframe
            title={`Suzuki ${modelName} official 360° viewer`}
            src={iframeUrl}
            className="configurator-360__iframe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="configurator-360__hint">
            Official Suzuki 360° viewer · select colour inside the viewer
          </p>
        </>
      )}

      {mode === 'empty' && (
        <p className="configurator-360__hint configurator-360__hint--solo">
          360° preview unavailable for this colour
        </p>
      )}
    </div>
  );
}

export function ConfiguratorExterior360({
  modelSlug,
  modelName,
  bodyColor,
}: ConfiguratorExterior360Props) {
  const localFrames = useMemo(
    () => resolveExterior360Frames(modelSlug, bodyColor),
    [modelSlug, bodyColor],
  );

  const iframeUrl = getSuzukiViewerIframeUrl(modelSlug);
  const viewKey = `${modelSlug}:${bodyColor?.id ?? 'default'}`;

  return (
    <Exterior360View
      key={viewKey}
      modelSlug={modelSlug}
      modelName={modelName}
      bodyColor={bodyColor}
      localFrames={localFrames}
      iframeUrl={iframeUrl}
    />
  );
}
