'use client';

import { preload } from 'react-dom';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ConfigColor } from '@/data/demo-configurator';
import {
  getSuzukiViewerUrl,
  hasExterior360Stub,
  resolveExterior360Frames,
  resolveExterior360Preview,
} from '@/lib/car-exterior-360';
import { getLineupCarImage } from '@/lib/lineup-assets';
import { has360Support } from '@/data/exterior-360-color-map';

type ConfiguratorExterior360Props = {
  modelSlug: string;
  modelName: string;
  bodyColor?: ConfigColor;
};

const PIXELS_PER_FRAME = 20;

type ViewMode = 'loading' | 'spin' | 'static' | 'empty';

type DragState = {
  active: boolean;
  lastX: number;
  remainder: number;
};

type Exterior360ViewProps = {
  modelSlug: string;
  modelName: string;
  bodyColor?: ConfigColor;
  localFrames: string[] | undefined;
};

function Exterior360View({
  modelSlug,
  modelName,
  bodyColor,
  localFrames,
}: Exterior360ViewProps) {
  const [spinReady, setSpinReady] = useState(false);
  const [mode, setMode] = useState<ViewMode>(() => {
    if (localFrames?.length) return 'loading';
    return 'static';
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<DragState>({ active: false, lastX: 0, remainder: 0 });

  const staticImage = resolveExterior360Preview(modelSlug, bodyColor) ?? getLineupCarImage(modelSlug);
  const viewerUrl = getSuzukiViewerUrl(modelSlug);

  useEffect(() => {
    if (!localFrames?.length) {
      setMode('static');
      return;
    }

    preload(localFrames[0], { as: 'image' });

    const first = document.createElement('img');
    first.onload = () => {
      setSpinReady(true);
      setMode('spin');

      for (let i = 1; i < localFrames.length; i++) {
        const img = document.createElement('img');
        img.src = localFrames[i];
      }
    };
    first.onerror = () => {
      setSpinReady(true);
      setMode('static');
    };
    first.src = localFrames[0];

    return () => {
      first.onload = null;
      first.onerror = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [localFrames]);

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

      {mode === 'static' && (
        <>
          <div className="configurator-360__static">
            <NextImage
              src={staticImage}
              alt={`Suzuki ${modelName}`}
              width={800}
              height={450}
              className="configurator-360__fallback"
              priority
            />
          </div>
          <p className="configurator-360__hint">
            {hasExterior360Stub(modelSlug)
              ? 'Exterior preview'
              : localFrames?.length
                ? '360° preview unavailable for this colour'
                : has360Support(modelSlug) && viewerUrl
                  ? (
                      <>
                        Exterior preview ·{' '}
                        <a
                          href={viewerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="configurator-360__viewer-link"
                        >
                          Open official 360° viewer
                        </a>
                      </>
                    )
                  : 'Exterior preview · 360° spin available for Vitara and Jimny'}
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

  const viewKey = `${modelSlug}:${bodyColor?.id ?? 'default'}`;

  return (
    <Exterior360View
      key={viewKey}
      modelSlug={modelSlug}
      modelName={modelName}
      bodyColor={bodyColor}
      localFrames={localFrames}
    />
  );
}
