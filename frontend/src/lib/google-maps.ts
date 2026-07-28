type GeoLocation = { lat: number; lng: number };

export function getGoogleDirectionsUrl(location: GeoLocation, address?: string): string {
  const destination = address
    ? encodeURIComponent(address)
    : `${location.lat},${location.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function getGoogleMapsPlaceUrl(location: GeoLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

type GoogleMapsWindow = Window & {
  google?: {
    maps: {
      Map: new (
        el: HTMLElement,
        opts: {
          center: GeoLocation;
          zoom: number;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
        },
      ) => GoogleMap;
      Marker: new (opts: {
        map: GoogleMap;
        position: GeoLocation;
        title?: string;
      }) => GoogleMarker;
      LatLngBounds: new () => GoogleLatLngBounds;
      event: {
        addListener: (target: object, name: string, handler: () => void) => void;
        clearInstanceListeners: (target: object) => void;
      };
    };
  };
  __suzukiMapsReady?: Promise<void>;
};

type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
  panTo: (pos: GeoLocation) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
  addListener: (name: string, handler: () => void) => void;
};

type GoogleLatLngBounds = {
  extend: (pos: GeoLocation) => void;
};

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser'));
  }

  const win = window as GoogleMapsWindow;
  if (win.google?.maps) return Promise.resolve();
  if (win.__suzukiMapsReady) return win.__suzukiMapsReady;

  win.__suzukiMapsReady = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-suzuki-maps="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.suzukiMaps = '1';
    script.onload = () => resolve();
    script.onerror = () => {
      win.__suzukiMapsReady = undefined;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return win.__suzukiMapsReady;
}

export function getGoogleMapsApi(): GoogleMapsWindow['google'] {
  return (window as GoogleMapsWindow).google;
}
