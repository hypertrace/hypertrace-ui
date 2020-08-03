import { GraphQlFieldFilter, GraphQlOperatorType } from '@hypertrace/distributed-tracing';

export function getApiDiscoveryStateFilter(): GraphQlFieldFilter {
  return new GraphQlFieldFilter('apiDiscoveryState', GraphQlOperatorType.Equals, 'DISCOVERED');
}
