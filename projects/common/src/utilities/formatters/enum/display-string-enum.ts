import { isNil, startCase } from 'lodash-es';

export const displayStringEnum = (provided?: string): string => {
  if (isNil(provided)) {
    return '-';
  }

  // This removes dashes and underscores and gives all words initial caps
  const startCased = startCase(provided);

  // We only want the first word capitalized.
  return `${startCased[0]}${startCased.substr(1).toLowerCase()}`;
};
