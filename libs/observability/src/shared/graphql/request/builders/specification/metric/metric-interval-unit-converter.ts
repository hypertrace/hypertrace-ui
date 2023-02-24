import { TimeUnit } from '@hypertrace/common';
import { GraphQlIntervalUnit } from '../../../../model/schema/interval/graphql-interval-unit';

export const convertToGraphQlIntervalUnit = (value: TimeUnit): GraphQlIntervalUnit => {
  switch (value) {
    case TimeUnit.Second:
      return GraphQlIntervalUnit.Seconds;
    case TimeUnit.Minute:
      return GraphQlIntervalUnit.Minutes;
    case TimeUnit.Hour:
      return GraphQlIntervalUnit.Hours;
    case TimeUnit.Day:
      return GraphQlIntervalUnit.Days;
    default:
      throw Error(`Unsupported time unit type: ${value}`);
  }
};
