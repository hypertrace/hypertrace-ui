import { isEqualWith } from 'lodash-es';

/**
 * Useful in a place like the default case of a switch statement where each enum value is a case. If a new enum
 * value is added, the switch will fail to compile as the value provided would not be never. At runtime, it will
 * throw the error message provided.
 */
export const assertUnreachable = (
  value: never,
  message: string = `Unexpectedly reached unreachable code with value: ${value}`
): never => {
  throw Error(message);
};

export const throwIfNil = <T>(
  // tslint:disable-next-line: no-null-undefined-union
  value: T | undefined | null,
  message: string = `Unexpectedly found undefined value`
): T => {
  if (value === undefined || value === null) {
    throw Error(message);
  }

  return value;
};

export const isEqualIgnoreFunctions = <T = unknown>(first: T, second: T) => isEqualWith(first, second, ignoreFunctions);

const ignoreFunctions = (first: unknown, second: unknown) => {
  if (typeof first === 'function' && typeof second === 'function') {
    return first.toString() === second.toString();
  }
};
