import { capitalize, isNil, lowerCase } from 'lodash-es';

export const displayStringEnum = (provided?: string, defaultValue: string = '-', separator: string = ' '): string => {
  if (isNil(provided)) {
    return defaultValue;
  }

  return capitalize(lowerCase(provided)).replace(' ', separator);
};
