import { GraphQlFieldFilter, GraphQlOperatorType } from '@hypertrace/distributed-tracing';

export class FilterUtil {
  public static getApiDiscoveryStateFilter(): GraphQlFieldFilter {
    return new GraphQlFieldFilter('apiDiscoveryState', GraphQlOperatorType.Equals, 'DISCOVERED');
  }
}
