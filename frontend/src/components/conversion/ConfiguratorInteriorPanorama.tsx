'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/base-path';
import { EquirectPanoramaViewer } from '@/lib/equirect-pano-webgl';
import type { InteriorPanorama } from '@/lib/car-interior-panorama';

type ConfiguratorInteriorPanoramaProps = {
  modelName: string;
  panorama: InteriorPanorama;
};

type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  startLon: number;
  startLat: number;
};

const DRAG_SENSITIVITY = 0.12;
const LAT_MIN = -85;
const LAT_MAX = 85;
const INITIAL_LON = 150;
/** Vertical FOV; 95° — широкий обзор без «рыбьего глаза» после фикса aspect ratio. */
const PANORAMA_FOV_DEGREES = 95;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ConfiguratorInteriorPanorama({
  modelName,
  panorama,
}: ConfiguratorInteriorPanoramaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<EquirectPanoramaViewer | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    startLon: INITIAL_LON,
    startLat: 0,
  });

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const imageUrl = panorama.imageUrl.startsWith('http')
    ? panorama.imageUrl
    : withBasePath(panorama.imageUrl);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let viewer: EquirectPanoramaViewer;
    try {
      viewer = new EquirectPanoramaViewer(canvas, {
        initialLon: INITIAL_LON,
        initialLat: 0,
        fovDegrees: PANORAMA_FOV_DEGREES,
      });
    } catch {
      setFailed(true);
      return;
    }

    viewerRef.current = viewer;
    setReady(false);
    setFailed(false);

    let cancelled = false;

    viewer
      .loadImage(imageUrl)
      .then(() => {
        if (cancelled) return;
        viewer.resize();
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    const observer = new ResizeObserver(() => {
      viewer.resize();
    });
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [imageUrl]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const view = viewer.getView();
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startLon: view.lon,
      startLat: view.lat,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    const viewer = viewerRef.current;
    if (!drag.active || !viewer) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    viewer.setView({
      lon: drag.startLon - deltaX * DRAG_SENSITIVITY,
      lat: clamp(drag.startLat + deltaY * DRAG_SENSITIVITY, LAT_MIN, LAT_MAX),
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
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

      <canvas
        ref={canvasRef}
        className="configurator-pano__canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label={`360 degree interior view of Suzuki ${modelName}. Drag to look around.`}
        aria-hidden={!ready}
      />

      {ready && (
        <p className="configurator-360__hint">Drag to look around · Interior 360°</p>
      )}
    </div>
  );
}
