// src/types/yandexMaps.ts

// Общие интерфейсы для Yandex Maps API
export interface YMapOptions {
  center: number[];
  zoom: number;
  controls?: string[];
  suppressMapOpenBlock?: boolean;
}

export interface PlacemarkProperties {
  balloonContent?: string;
  hintContent?: string;
}

export interface PlacemarkOptions {
  preset?: string;
  draggable?: boolean;
  iconLayout?: string;
  iconImageHref?: string;
  iconImageSize?: number[];
  iconImageOffset?: number[];
}

export interface MapEvent {
  get: (key: string) => number[];
}

export interface GeocodeResult {
  geoObjects: {
    get: (index: number) => {
      getAddressLine?: () => string;
    } | null;
  };
}

export interface YPlacemark {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
  geometry: {
    getCoordinates: () => number[];
  };
  properties: {
    set: (key: string, value: string) => void;
  };
}

export interface YGeoObjectCollection {
  add: (geoObject: YPlacemark) => void;
  getBounds: () => number[][] | null;
}

export interface YMap {
  events: {
    add: (eventName: string, handler: (event: MapEvent) => void) => void;
  };
  geoObjects: {
    add: (object: YPlacemark | YGeoObjectCollection) => void;
    remove: (object: YPlacemark) => void;
    removeAll: () => void;
  };
  setCenter: (center: number[], zoom?: number, options?: { duration: number }) => void;
  setBounds: (bounds: number[][], options?: { checkZoomRange: boolean; zoomMargin: number[] }) => void;
  options: {
    set: (options: { suppressMapOpenBlock?: boolean }) => void;
  };
}

// Основной интерфейс Yandex Maps API
export interface YandexMapsAPI {
  ready: (callback: () => void) => void;
  Map: new (container: string | HTMLElement, options: YMapOptions) => YMap;
  Placemark: new (coordinates: number[], properties: PlacemarkProperties, options?: PlacemarkOptions) => YPlacemark;
  GeoObjectCollection: new () => YGeoObjectCollection;
  geocode: (query: string | number[]) => Promise<GeocodeResult>;
}

// Глобальное объявление
declare global {
  interface Window {
    ymaps?: YandexMapsAPI;
  }
}

export {};
