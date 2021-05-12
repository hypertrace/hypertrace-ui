import { isNil, startCase } from 'lodash-es';

export const displayStringEnum = (provided?: string, unknown: string = '-', separator: string = ' '): string => {
  if (isNil(provided)) {
    return unknown;
  }

  // This removes dashes and underscores and gives all words initial caps
  const startCased = startCase(provided);

  const startCasedSeparated = startCased.replace(' ', separator);

  // We only want the first word capitalized.
  return `${startCasedSeparated[0]}${startCasedSeparated.substr(1).toLowerCase()}`;
};
