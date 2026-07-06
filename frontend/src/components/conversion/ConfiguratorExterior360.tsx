'use client';

import { preload } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Pixels of horizontal drag required to advance one frame.
 * Higher = slower / more deliberate rotation feel.
 */
const PIXELS_PER_FRAME = 20;

type ViewMode = 'loading' | 'spin' | 'iframe' | 'empty';

type DragState = {
  active: boolean;
  lastX: number;
  remainder: number;
};

type Exterior360ViewProps = {
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
  const [spinReady, setSpinReady] = useState(false);
  const [mode, setMode] = useState<ViewMode>(() =>
    localFrames?.length ? 'loading' : iframeUrl ? 'iframe' : 'empty',
  );

  // Direct refs — frame updates bypass React render cycle for maximum smoothness.
  const imgRef = useRef<HTMLImageElement>(null);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<DragState>({ active: false, lastX: 0, remainder: 0 });

  // Load first frame; when ready switch to spin mode and preload the rest.
  useEffect(() => {
    if (!localFrames?.length) return;

    preload(localFrames[0], { as: 'image' });

    const first = new Image();
    first.onload = () => {
      setSpinReady(true);
      setMode('spin');

      // Preload remaining frames in background so dragging is instant.
      for (let i = 1; i < localFrames.length; i++) {
        const img = new Image();
        img.src = localFrames[i];
      }
    };
    first.onerror = () => {
      setSpinReady(true);
      setMode(iframeUrl ? 'iframe' : 'empty');
    };
    first.src = localFrames[0];

    return () => {
      first.onload = null;
      first.onerror = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [iframeUrl, localFrames]);

  // Commit a new frame index to the DOM without triggering React re-render.
  const commitFrame = (index: number) => {
    if (!localFrames?.length || !imgRef.current) return;
    const total = localFrames.length;
    const safeIndex = ((index % total) + total) % total;
    frameIndexRef.current = safeIndex;
    imgRef.current.src = localFrames[safeIndex];
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== 'spin') return;
    dragRef.current = { active: true, lastX: event.clientX, remainder: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || !localFrames?.length) return;

    const delta = event.clientX - drag.lastX;
    drag.lastX = event.clientX;
    drag.remainder += delta;

    const steps = Math.trunc(drag.remainder / PIXELS_PER_FRAME);
    if (steps === 0) return;

    drag.remainder -= steps * PIXELS_PER_FRAME;
    const nextIndex = frameIndexRef.current - steps;

    // Throttle DOM updates to animation frame rate.
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => commitFrame(nextIndex));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const colorLabel = bodyColor?.name ?? '';
  const showLoader = mode === 'loading' || (mode === 'spin' && !spinReady);
  const firstFrameUrl = localFrames?.[0] ?? null;

  return (
    <div
      className={`configurator-360${showLoader ? ' configurator-360--loading' : ''}${mode === 'spin' ? ' configurator-360--spin' : ''}`}
    >
      {showLoader && (
        <div className="configurator-360__placeholder" aria-hidden="true">
          <div className="configurator-360__loader" />
        </div>
      )}

      {mode === 'spin' && spinReady && firstFrameUrl && (
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
            {/* eslint-disable-next-line @next/next/no-img-element -- 360 frame sequence; src managed via ref */}
            <img
              ref={imgRef}
              src={firstFrameUrl}
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
      modelName={modelName}
      bodyColor={bodyColor}
      localFrames={localFrames}
      iframeUrl={iframeUrl}
    />
  );
}
