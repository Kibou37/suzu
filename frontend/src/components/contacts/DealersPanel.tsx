'use client';

import {
  dealerServices,
  dealers as allDealers,
  getDealerServiceLabel,
  type Dealer,
  type DealerServiceId,
} from '@suzuki/shared';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getGoogleDirectionsUrl,
  getGoogleMapsApi,
  getGoogleMapsPlaceUrl,
  loadGoogleMapsScript,
} from '@/lib/google-maps';

type MarkerHandle = {
  setMap: (map: unknown) => void;
  addListener: (name: string, handler: () => void) => void;
};

export function DealersPanel() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{
    map: {
      fitBounds: (bounds: unknown, padding?: number) => void;
      panTo: (pos: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
    };
    markers: MarkerHandle[];
  } | null>(null);

  const [city, setCity] = useState('');
  const [service, setService] = useState<DealerServiceId | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  const cities = useMemo(
    () => [...new Set(allDealers.map((item) => item.city))].sort((a, b) => a.localeCompare(b)),
    [],
  );

  const filtered = useMemo(() => {
    return allDealers.filter((item) => {
      if (city && item.city !== city) return false;
      if (service && !item.services.includes(service)) return false;
      return true;
    });
  }, [city, service]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (selectedId && !filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      try {
        await loadGoogleMapsScript(apiKey!);
        if (cancelled || !mapRef.current) return;

        const google = getGoogleMapsApi();
        if (!google?.maps) {
          throw new Error('Google Maps API unavailable');
        }

        const map = new google.maps.Map(mapRef.current, {
          center: allDealers[0]?.location ?? { lat: 54.5, lng: -2.5 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = { map, markers: [] };
        setMapReady(true);
        setMapError(null);
      } catch (err) {
        if (!cancelled) {
          setMapError(err instanceof Error ? err.message : 'Failed to load map');
          setMapReady(false);
        }
      }
    }

    void initMap();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    const instance = mapInstanceRef.current;
    const google = getGoogleMapsApi();
    if (!instance || !google?.maps || !mapReady) return;

    for (const marker of instance.markers) {
      marker.setMap(null);
    }
    instance.markers = [];

    if (filtered.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    for (const dealer of filtered) {
      const marker = new google.maps.Marker({
        map: instance.map as never,
        position: dealer.location,
        title: dealer.name,
      }) as unknown as MarkerHandle;

      marker.addListener('click', () => {
        setSelectedId(dealer.id);
        setListOpen(true);
      });

      instance.markers.push(marker);
      bounds.extend(dealer.location);
    }

    if (selected) {
      instance.map.panTo(selected.location);
      instance.map.setZoom(filtered.length === 1 ? 13 : 11);
    } else if (filtered.length === 1) {
      instance.map.panTo(filtered[0].location);
      instance.map.setZoom(13);
    } else {
      instance.map.fitBounds(bounds, 64);
    }
  }, [filtered, mapReady, selected]);

  function selectDealer(dealer: Dealer) {
    setSelectedId(dealer.id);
    setListOpen(true);
  }

  return (
    <div className="dealers-page">
      <div ref={mapRef} className="dealers-page__map" aria-label="Dealers map" />

      {!apiKey || mapError || !mapReady ? (
        <div className="dealers-page__map-fallback" aria-hidden={Boolean(apiKey && mapReady)}>
          {!apiKey ? (
            <p>
              Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> (Maps JavaScript API) to show the map.
            </p>
          ) : mapError ? (
            <p>{mapError}</p>
          ) : (
            <p>Loading map…</p>
          )}
        </div>
      ) : null}

      <aside className={`dealers-panel${listOpen ? ' is-open' : ''}`}>
        <div className="dealers-panel__tags">
          <button
            type="button"
            className={`dealers-panel__tag${listOpen ? ' is-active' : ''}`}
            onClick={() => setListOpen((open) => !open)}
            aria-expanded={listOpen}
          >
            Dealer list
          </button>

          <label className="dealers-panel__tag dealers-panel__tag--select">
            <span className="visually-hidden">City</span>
            <select
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setListOpen(true);
              }}
            >
              <option value="">Select city</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="dealers-panel__tag dealers-panel__tag--select">
            <span className="visually-hidden">Dealer services</span>
            <select
              value={service}
              onChange={(event) => {
                setService(event.target.value as DealerServiceId | '');
                setListOpen(true);
              }}
            >
              <option value="">Dealer services</option>
              {dealerServices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {listOpen && (
          <div className="dealers-panel__body">
            <p className="dealers-panel__count">
              {filtered.length} dealer{filtered.length === 1 ? '' : 's'}
            </p>

            {filtered.length === 0 ? (
              <p className="dealers-panel__empty">No dealers match the selected filters.</p>
            ) : (
              <ul className="dealers-panel__list">
                {filtered.map((dealer) => {
                  const isActive = selected?.id === dealer.id;
                  const directionsUrl = getGoogleDirectionsUrl(dealer.location, dealer.address);
                  const mapsUrl = getGoogleMapsPlaceUrl(dealer.location);

                  return (
                    <li key={dealer.id}>
                      <article
                        className={`dealers-card${isActive ? ' is-active' : ''}`}
                        onClick={() => selectDealer(dealer)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            selectDealer(dealer);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                      >
                        <h2 className="dealers-card__name">{dealer.name}</h2>
                        <p className="dealers-card__address">{dealer.address}</p>
                        <a
                          href={`tel:${dealer.phone.replace(/\s/g, '')}`}
                          className="dealers-card__phone"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {dealer.phone}
                        </a>
                        <ul className="dealers-card__services">
                          {dealer.services.map((item) => (
                            <li key={item}>{getDealerServiceLabel(item)}</li>
                          ))}
                        </ul>
                        <p className="dealers-card__hours">{dealer.workingHours}</p>
                        <div className="dealers-card__actions">
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dealers-card__link"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Get directions
                          </a>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dealers-card__link"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Open map
                          </a>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
