import { Injectable } from '@angular/core';
import { DateCoercer, Dictionary } from '@hypertrace/common';
import { GraphQlArgument, GraphQlSelection } from '@hypertrace/graphql-client';
import { isNil } from 'lodash-es';
import { INTERVAL_START_QUERY_KEY } from '../../../model/schema/explore';
import { GlobalGraphQlFilterService } from '../../../model/schema/filter/global-graphql-filter.service';
import { GraphQlGroupBy } from '../../../model/schema/groupby/graphql-group-by';
import { ExploreSpecification } from '../../../model/schema/specifications/explore-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../builders/argument/graphql-observability-argument-builder';
import { GraphQlSelectionBuilder } from '../../builders/selections/graphql-selection-builder';
import { ExploreSpecificationBuilder } from '../../builders/specification/explore/explore-specification-builder';
import {
  EntityContextOptions,
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreRequest,
  GraphQlExploreResponse,
  GraphQlExploreResult,
  GraphQlExploreResultValue,
  GraphQlExploreServerResponse,
  GraphQlExploreServerResult,
} from './explore-query';

@Injectable({ providedIn: 'root' })
export class ExploreGraphqlQueryBuilderService {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public constructor(private readonly globalGraphQlFilterService: GlobalGraphQlFilterService) {}

  public buildRequestArguments(request: GraphQlExploreRequest): GraphQlArgument[] {
    return [
      {
        name: 'scope',
        value: request.context,
      },
      this.argBuilder.forLimit(request.limit),
      this.argBuilder.forTimeRange(request.timeRange),
      ...this.argBuilder.forOffset(request.offset),
      ...this.argBuilder.forInterval(request.interval),
      ...this.buildFilters(request),
      ...this.argBuilder.forGroupBy(request.groupBy),
      ...this.argBuilder.forOrderBys(request.orderBy),
      ...this.buildEntityContextOptionsArgument(request.entityContextOptions),
    ];
  }

  protected buildFilters(request: GraphQlExploreRequest): GraphQlArgument[] {
    return this.argBuilder.forFilters(
      request.ignoreGlobalFilters ?? false
        ? request.filters ?? []
        : this.globalGraphQlFilterService.mergeGlobalFilters(request.context, request.filters),
    );
  }

  public buildRequestSpecifications(request: GraphQlExploreRequest): GraphQlSelection[] {
    return [
      ...this.getAnyIntervalSelections(request),
      ...this.selectionBuilder.fromSpecifications(this.groupByAsSpecifications(request.groupBy)),
      ...this.selectionBuilder.fromSpecifications(request.selections),
    ];
  }

  public buildResponse(response: GraphQlExploreServerResponse, request: GraphQlExploreRequest): GraphQlExploreResponse {
    return {
      total: response.total,
      results: response.results.map(result => this.convertResultRow(result, request)),
    };
  }

  private convertResultRow(row: GraphQlExploreServerResult, request: GraphQlExploreRequest): GraphQlExploreResult {
    return {
      ...this.getIntervalResultFragment(row, request),
      ...this.getSelectionResultFragment(row, this.groupByAsSpecifications(request.groupBy)),
      ...this.getSelectionResultFragment(row, request.selections),
    };
  }

  private getIntervalResultFragment(
    row: GraphQlExploreServerResult,
    request: GraphQlExploreRequest,
  ): Pick<GraphQlExploreResult, typeof GQL_EXPLORE_RESULT_INTERVAL_KEY> {
    if (request.interval) {
      return {
        [GQL_EXPLORE_RESULT_INTERVAL_KEY]: this.dateCoercer.coerce(row[INTERVAL_START_QUERY_KEY]),
      };
    }

    return {};
  }

  private getSelectionResultFragment(
    row: GraphQlExploreServerResult,
    specifications: ExploreSpecification[],
  ): Pick<GraphQlExploreResult, string> {
    return Object.assign(
      {},
      ...specifications.map(specification => ({
        [specification.resultAlias()]: specification.extractFromServerData(
          row as Dictionary<GraphQlExploreResultValue>,
        ),
      })),
    ) as Pick<GraphQlExploreResult, string>;
  }

  private getAnyIntervalSelections(request: GraphQlExploreRequest): GraphQlSelection[] {
    return request.interval ? [{ path: 'intervalStart', alias: INTERVAL_START_QUERY_KEY }] : [];
  }

  private groupByAsSpecifications(groupBy?: GraphQlGroupBy): ExploreSpecification[] {
    return (groupBy?.keyExpressions ?? []).map(expression =>
      this.specBuilder.exploreSpecificationForAttributeExpression(expression),
    );
  }

  private buildEntityContextOptionsArgument(entityContextOptions?: EntityContextOptions): GraphQlArgument[] {
    if (!isNil(entityContextOptions) && !isNil(entityContextOptions.includeNonLiveEntities)) {
      return [
        {
          name: 'entityContextOptions',
          value: { includeNonLiveEntities: entityContextOptions.includeNonLiveEntities },
        },
      ];
    }

    return [];
  }
}
