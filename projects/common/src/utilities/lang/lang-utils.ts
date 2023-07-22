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

export const isNonEmptyString = (str: string | undefined | null): str is string =>
  str !== undefined && str !== null && str !== '';

export const hasOwnProperty = <X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> =>
  // Since Typescript doesn't know how to type guard native hasOwnProperty, we wrap it here.
  obj.hasOwnProperty(prop);
