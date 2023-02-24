import { Dictionary } from '@hypertrace/common';

export interface GraphQlArgument<T extends GraphQlArgumentValue = GraphQlArgumentValue> {
  name: string;
  value: T;
}

export interface GraphQlArgumentArray extends Array<GraphQlArgumentValue> {}
export interface GraphQlArgumentObject {
  [key: string]: GraphQlArgumentValue;
}
export class GraphQlEnumArgument<T extends string> {
  public constructor(private readonly value: T) {}

  public toString(): string {
    return this.value.toUpperCase();
  }
}

export type GraphQlArgumentValue =
  | string
  | number
  | boolean
  | Date
  | GraphQlArgumentObject
  | GraphQlArgumentArray
  | GraphQlEnumArgument<string>;

/**
 * @param value
 * Convert the value to GraphQL argument value
 */
export const getValueAsGraphQlArgument = (
  value: unknown,
  considerAllCapsStringAsEnum: boolean = false,
  isArrayElement: boolean = false
): GraphQlArgumentValue => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(v => getValueAsGraphQlArgument(v, considerAllCapsStringAsEnum, true));
  }

  if (typeof value === 'object' && value !== null) {
    return getObjectAsGraphQlArgument(value as Dictionary<unknown>, considerAllCapsStringAsEnum);
  }

  if (typeof value === 'string' && considerAllCapsStringAsEnum && !isArrayElement && /^[A-Z_]+$/.test(value)) {
    return new GraphQlEnumArgument(value);
  }

  return value as string | number | boolean;
};

/**
 * @param object
 * Convert the object to GraphQL argument object
 */
export const getObjectAsGraphQlArgument = (
  object: Dictionary<unknown>,
  considerAllCapsStringAsEnum: boolean = false
): GraphQlArgumentObject => {
  const argumentObject: GraphQlArgumentObject = {};

  for (const key of Object.keys(object)) {
    if (object[key] === null || object[key] === undefined) {
      continue;
    }
    argumentObject[key] = getValueAsGraphQlArgument(object[key], considerAllCapsStringAsEnum);
  }

  return argumentObject;
};
