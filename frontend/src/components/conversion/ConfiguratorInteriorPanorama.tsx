'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/base-path';
import type { InteriorPanorama } from '@/lib/car-interior-panorama';

type ConfiguratorInteriorPanoramaProps = {
  modelName: string;
  panorama: InteriorPanorama;
};

type ViewState = {
  /** Horizontal look angle 0–100 (maps to background-position-x). */
  yaw: number;
  /** Vertical look angle 0–100 (maps to background-position-y). */
  pitch: number;
};

type DragState = {
  active: boolean;
  lastX: number;
  lastY: number;
};

const INITIAL_VIEW: ViewState = { yaw: 50, pitch: 50 };

export function ConfiguratorInteriorPanorama({
  modelName,
  panorama,
}: ConfiguratorInteriorPanoramaProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({ active: false, lastX: 0, lastY: 0 });
  const viewRef = useRef<ViewState>(INITIAL_VIEW);
  const rafRef = useRef<number>(0);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const imageUrl = panorama.imageUrl.startsWith('http')
    ? panorama.imageUrl
    : withBasePath(panorama.imageUrl);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setReady(true);
    img.onerror = () => setFailed(true);
    img.src = imageUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [imageUrl]);

  const applyView = () => {
    if (!canvasRef.current) return;
    const { yaw, pitch } = viewRef.current;
    canvasRef.current.style.backgroundPosition = `${yaw}% ${pitch}%`;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    const view = viewRef.current;
    view.yaw = Math.min(100, Math.max(0, view.yaw - deltaX * 0.12));
    view.pitch = Math.min(82, Math.max(18, view.pitch - deltaY * 0.1));

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyView);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (failed) {
    return (
      <div className="configurator-pano configurator-pano--empty">
        <p className="configurator-360__hint configurator-360__hint--solo">
          Interior 360° preview unavailable
        </p>
      </div>
    );
  }

  return (
    <div className={`configurator-pano${ready ? '' : ' configurator-pano--loading'}`}>
      {!ready && (
        <div className="configurator-360__placeholder" aria-hidden="true">
          <div className="configurator-360__loader" />
        </div>
      )}

      {ready && (
        <>
          <div
            ref={canvasRef}
            className="configurator-pano__canvas"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${INITIAL_VIEW.yaw}% ${INITIAL_VIEW.pitch}%`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label={`360 degree interior view of Suzuki ${modelName}. Drag to look around.`}
          />
          <p className="configurator-360__hint">Drag to look around · Interior 360°</p>
        </>
      )}
    </div>
  );
}
