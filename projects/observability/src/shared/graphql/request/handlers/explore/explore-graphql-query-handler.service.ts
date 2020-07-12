import { Injectable } from '@angular/core';
import { DateCoercer, Dictionary, TimeDuration } from '@hypertrace/common';
import {
  GraphQlFilter,
  GraphQlSelectionBuilder,
  GraphQlSortBySpecification,
  GraphQlTimeRange,
  SpecificationContextBuilder
} from '@hypertrace/distributed-tracing';
import {
  GraphQlEnumArgument,
  GraphQlHandlerType,
  GraphQlQueryHandler,
  GraphQlSelection
} from '@hypertrace/graphql-client';
import { GraphQlGroupBy } from '../../../model/schema/groupby/graphql-group-by';
import { ExploreSpecification, ExploreValue } from '../../../model/schema/specifications/explore-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../builders/argument/graphql-observability-argument-builder';

const GROUP_NAME_QUERY_KEY = '__group';
const INTERVAL_START_QUERY_KEY = '__intervalStart';

@Injectable({ providedIn: 'root' })
export class ExploreGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlExploreRequest, GraphQlExploreResponse> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public constructor(private readonly specificationContextBuilder: SpecificationContextBuilder) {}

  public matchesRequest(request: unknown): request is GraphQlExploreRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlExploreRequest>).requestType === EXPLORE_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlExploreRequest): GraphQlSelection {
    const totalSelection = request.includeTotal ? [{ path: 'total' }] : [];
    const context = this.specificationContextBuilder.buildContext();

    return {
      path: 'explore',
      arguments: [
        {
          name: 'context',
          value: new GraphQlEnumArgument(request.context)
        },
        this.argBuilder.forLimit(request.limit),
        this.argBuilder.forTimeRange(request.timeRange),
        ...this.argBuilder.forOffset(request.offset),
        ...this.argBuilder.forInterval(request.interval === 'AUTO' ? context.getAutoInterval() : request.interval),
        ...this.argBuilder.forFilters(request.filters),
        ...this.argBuilder.forGroupBy(request.groupBy),
        ...this.argBuilder.forOrderBys(request.orderBy)
      ],
      children: [
        {
          path: 'results',
          children: [
            ...this.getAnyMetaSelections(request),
            ...this.selectionBuilder.fromSpecifications(request.selections)
          ]
        },
        ...totalSelection
      ]
    };
  }

  public convertResponse(
    response: GraphQlExploreServerResponse,
    request: GraphQlExploreRequest
  ): GraphQlExploreResponse {
    return {
      total: response.total,
      results: response.results.map(result => this.convertResultRow(result, request))
    };
  }

  private convertResultRow(row: GraphQlExploreServerResult, request: GraphQlExploreRequest): GraphQlExploreResult {
    return {
      ...this.getIntervalResultFragment(row, request),
      ...this.getGroupByResultFragment(row, request),
      ...this.getSelectionResultFragment(row, request)
    };
  }

  private getIntervalResultFragment(
    row: GraphQlExploreServerResult,
    request: GraphQlExploreRequest
  ): Pick<GraphQlExploreResult, typeof GQL_EXPLORE_RESULT_INTERVAL_KEY> {
    if (request.interval) {
      return {
        [GQL_EXPLORE_RESULT_INTERVAL_KEY]: this.dateCoercer.coerce(row[INTERVAL_START_QUERY_KEY])
      };
    }

    return {};
  }

  private getGroupByResultFragment(
    row: GraphQlExploreServerResult,
    request: GraphQlExploreRequest
  ): Pick<GraphQlExploreResult, typeof GQL_EXPLORE_RESULT_GROUP_KEY> {
    if (request.groupBy) {
      return {
        [GQL_EXPLORE_RESULT_GROUP_KEY]: row[GROUP_NAME_QUERY_KEY]
      };
    }

    return {};
  }

  private getSelectionResultFragment(
    row: GraphQlExploreServerResult,
    request: GraphQlExploreRequest
  ): Pick<GraphQlExploreResult, string> {
    return Object.assign(
      {},
      ...request.selections.map(selection => ({
        [selection.resultAlias()]: selection.extractFromServerData(row as Dictionary<GraphQlExploreResultValue>)
      }))
    );
  }

  private getAnyMetaSelections(request: GraphQlExploreRequest): GraphQlSelection[] {
    const intervalSelections = request.interval ? [{ path: 'intervalStart', alias: INTERVAL_START_QUERY_KEY }] : [];

    const groupBySelections = request.groupBy ? [{ path: 'groupName', alias: GROUP_NAME_QUERY_KEY }] : [];

    return [...intervalSelections, ...groupBySelections];
  }
}

export const EXPLORE_GQL_REQUEST = Symbol('GraphQL Query Request');
export const GQL_EXPLORE_RESULT_INTERVAL_KEY = Symbol('Interval Start');
export const GQL_EXPLORE_RESULT_GROUP_KEY = Symbol('Group');

export interface GraphQlExploreRequest {
  requestType: typeof EXPLORE_GQL_REQUEST;
  selections: ExploreSpecification[];
  context: string; // Scope of Request. Example: Trace, Span
  limit: number;
  timeRange: GraphQlTimeRange;
  offset?: number;
  includeTotal?: boolean;
  interval?: Interval;
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
  [GQL_EXPLORE_RESULT_GROUP_KEY]?: string;

  [key: string]: GraphQlExploreResultValue;
}

type GraphQlExploreValueType = number | string | boolean | undefined;

export interface GraphQlExploreResultValue extends ExploreValue<GraphQlExploreValueType> {
  units?: string;
}

interface GraphQlExploreServerResponse {
  total?: number;
  results: GraphQlExploreServerResult[];
}

interface GraphQlExploreServerResult {
  [GROUP_NAME_QUERY_KEY]?: string;
  [INTERVAL_START_QUERY_KEY]?: string;

  [key: string]: GraphQlExploreResultValue | string | undefined;
}

export type Interval = TimeDuration | 'AUTO' | undefined;
