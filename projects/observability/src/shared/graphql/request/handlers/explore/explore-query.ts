import { TimeDuration } from '@hypertrace/common';
import { INTERVAL_START_QUERY_KEY } from '../../../model/schema/explore';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlGroupBy } from '../../../model/schema/groupby/graphql-group-by';
import { GraphQlSortBySpecification } from '../../../model/schema/sort/graphql-sort-by-specification';
import { ExploreSpecification, ExploreValue } from '../../../model/schema/specifications/explore-specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';

export const EXPLORE_GQL_REQUEST = Symbol('GraphQL Query Request');

export const GQL_EXPLORE_RESULT_INTERVAL_KEY = Symbol('Interval Start');

export interface GraphQlExploreRequest {
  requestType: typeof EXPLORE_GQL_REQUEST;
  selections: ExploreSpecification[];
  context: string; // Scope of Request. Example: Trace, Span
  limit: number;
  timeRange: GraphQlTimeRange;
  offset?: number;
  includeTotal?: boolean;
  interval?: TimeDuration;
  orderBy?: GraphQlSortBySpecification[];
  filters?: GraphQlFilter[];
  groupBy?: GraphQlGroupBy;
}

export interface GraphQlExploreResponse {
  total?: number;
  results: GraphQlExploreResult[];
}

export interface GraphQlExploreResult {
  [GQL_EXPLORE_RESULT_INTERVAL_KEY]?: Date;
  [key: string]: GraphQlExploreResultValue;
}

type GraphQlExploreValueType = number | string | boolean | undefined;

export interface GraphQlExploreResultValue extends ExploreValue<GraphQlExploreValueType> {
  units?: string;
}

export interface GraphQlExploreServerResponse {
  total?: number;
  results: GraphQlExploreServerResult[];
}

export interface GraphQlExploreServerResult {
  [INTERVAL_START_QUERY_KEY]?: string;
  [key: string]: GraphQlExploreResultValue | string | undefined;
}
