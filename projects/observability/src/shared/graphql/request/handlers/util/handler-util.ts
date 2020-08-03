import { GraphQlFieldFilter, GraphQlOperatorType } from '@hypertrace/distributed-tracing';

export const getApiDiscoveryStateFilter = (): GraphQlFieldFilter =>
  new GraphQlFieldFilter('apiDiscoveryState', GraphQlOperatorType.Equals, 'DISCOVERED');
