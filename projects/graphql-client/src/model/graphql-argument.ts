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
