'use client';

import { useEffect, useState } from 'react';

export type ShowroomTourConfig = {
  /** iframe embed (Matterport, Kuula, hosted Pannellum, etc.) */
  embedUrl?: string;
  /** Fallback video when no embed */
  videoUrl?: string;
  title?: string;
};

const DEFAULT_TITLE = 'Showroom 360° tour';

function resolveConfig(raw: ShowroomTourConfig | null): ShowroomTourConfig {
  const fromEnvEmbed = process.env.NEXT_PUBLIC_SHOWROOM_TOUR_EMBED_URL?.trim();
  const fromEnvVideo = process.env.NEXT_PUBLIC_SHOWROOM_TOUR_VIDEO_URL?.trim();

  return {
    title: raw?.title?.trim() || DEFAULT_TITLE,
    embedUrl: raw?.embedUrl?.trim() || fromEnvEmbed || '',
    videoUrl: raw?.videoUrl?.trim() || fromEnvVideo || '',
  };
}

/**
 * Dealer can fill `public/showroom-tour.json` or set
 * NEXT_PUBLIC_SHOWROOM_TOUR_EMBED_URL / NEXT_PUBLIC_SHOWROOM_TOUR_VIDEO_URL.
 * Without assets — honest placeholder.
 */
export function ShowroomTourSection() {
  const [config, setConfig] = useState<ShowroomTourConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/showroom-tour.json', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as ShowroomTourConfig;
          if (!cancelled) setConfig(resolveConfig(json));
        } else if (!cancelled) {
          setConfig(resolveConfig(null));
        }
      } catch {
        if (!cancelled) setConfig(resolveConfig(null));
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !config) {
    return (
      <section className="showroom-tour" aria-busy="true">
        <h2 className="about-page__heading">{DEFAULT_TITLE}</h2>
        <div className="showroom-tour__frame showroom-tour__frame--empty">
          <p>Loading tour…</p>
        </div>
      </section>
    );
  }

  const hasEmbed = Boolean(config.embedUrl);
  const hasVideo = Boolean(config.videoUrl);

  return (
    <section className="showroom-tour" id="showroom-tour">
      <h2 className="about-page__heading">{config.title || DEFAULT_TITLE}</h2>

      {hasEmbed ? (
        <div className="showroom-tour__frame">
          <iframe
            title={config.title || DEFAULT_TITLE}
            src={config.embedUrl}
            allow="xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : hasVideo ? (
        <div className="showroom-tour__frame">
          <video
            className="showroom-tour__video"
            src={config.videoUrl}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      ) : (
        <div className="showroom-tour__frame showroom-tour__frame--empty">
          <p className="showroom-tour__empty-title">Tour media not uploaded yet</p>
          <p>
            Add a Matterport / Kuula / Pannellum embed URL or a walkthrough video when materials
            are ready.
          </p>
          <ol className="showroom-tour__howto">
            <li>
              Edit <code>frontend/public/showroom-tour.json</code> — set <code>embedUrl</code> or{' '}
              <code>videoUrl</code>
            </li>
            <li>
              Or set env <code>NEXT_PUBLIC_SHOWROOM_TOUR_EMBED_URL</code> /{' '}
              <code>NEXT_PUBLIC_SHOWROOM_TOUR_VIDEO_URL</code> and rebuild
            </li>
          </ol>
        </div>
      )}
    </section>
  );
}
