import { GraphQlArgumentObject } from '@hypertrace/graphql-client';

export interface GraphQlFilter {
  asArgumentObjects(): GraphQlArgumentObject[];
}

export interface GraphQlFilterable {
  getFilters(inherited: GraphQlFilter[]): GraphQlFilter[];
}

export const enum GraphQlFilterType {
  Id = 'ID',
  Attribute = 'ATTRIBUTE'
}

export const enum GraphQlOperatorType {
  Equals = 'EQUALS',
  NotEquals = 'NOT_EQUALS',
  LessThan = 'LESS_THAN',
  LessThanOrEqualTo = 'LESS_THAN_OR_EQUAL_TO',
  GreaterThan = 'GREATER_THAN',
  GreaterThanOrEqualTo = 'GREATER_THAN_OR_EQUAL_TO',
  Like = 'LIKE',
  In = 'IN',
  NotIn = 'NOT_IN',
  ContainsKey = 'CONTAINS_KEY'
}
