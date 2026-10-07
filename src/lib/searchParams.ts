import {
  createSearchParamsCache,
  parseAsString,
  parseAsArrayOf,
} from 'nuqs/server';

export const dashboardParsers = {
  from: parseAsString, // iso date string
  to: parseAsString, // iso date string
  statuses: parseAsArrayOf(parseAsString).withDefault([]),
};

export const searchParamsCache = createSearchParamsCache(dashboardParsers);
