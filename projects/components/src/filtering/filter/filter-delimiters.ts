import { isNonEmptyString } from '@hypertrace/common';

export const ARRAY_DELIMITER = ',';
export const MAP_LHS_DELIMITER = '.';
export const MAP_RHS_DELIMITER = ':';

export const splitFirstOccurrence = (str: string, delimiter: string): string[] => {
  const firstIndex = str.indexOf(delimiter);

  return [str.substr(0, firstIndex), str.substr(firstIndex + 1)].filter(s => isNonEmptyString(s));
};
