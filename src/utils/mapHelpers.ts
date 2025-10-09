import { type Filters } from 'components/GeoportalFilters/GeoportalFilters';

import { type MapObject } from 'api/GeoPartal.api';

export const applyFilters = (objects: MapObject[], filters: Filters): MapObject[] => {
  return objects.filter((obj) => {
    // Фильтр по поиску
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      const searchFields = [obj.object_name, obj.address, obj.request_number].map((field) => field.toLowerCase());

      const matchesSearch = searchFields.some((field) => field.includes(searchTerm));

      if (!matchesSearch) {
        return false;
      }
    }

    // Фильтр по статусу
    if (filters.status && obj.status !== filters.status) {
      return false;
    }

    return true;
  });
};

export const getTypeIcon = (type: string | null): string => {
  if (!type) return '📍';

  const typeIcons: Record<string, string> = {
    water: '💧',
    sewer: '🚰',
    gas: '🔥',
    electric: '⚡',
    other: '📍'
  };

  return typeIcons[type] || '📍';
};
