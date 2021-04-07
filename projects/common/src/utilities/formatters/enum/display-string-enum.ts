import { isNil, startCase } from 'lodash-es';

export const displayStringEnum = (provided?: string): string => {
  if (isNil(provided)) {
    return '-';
  }

  return startCase(provided.toLowerCase());
};
