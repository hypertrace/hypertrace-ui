import { Injectable, OnDestroy } from '@angular/core';
import {
  forkJoinSafeEmpty,
  IntervalDurationService,
  isEqualIgnoreFunctions,
  TimeDuration,
  TimeRangeService
} from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import { uniqBy } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, defaultIfEmpty, distinctUntilChanged, map, shareReplay, takeUntil } from 'rxjs/operators';
import { AttributeMetadata } from '../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../graphql/model/metrics/metric-aggregation';
import { GraphQlGroupBy } from '../../graphql/model/schema/groupby/graphql-group-by';
import { ObservabilityTraceType } from '../../graphql/model/schema/observability-traces';
import { GraphQlSortBySpecification } from '../../graphql/model/schema/sort/graphql-sort-by-specification';
import { GraphQlSortDirection } from '../../graphql/model/schema/sort/graphql-sort-direction';
import { SPAN_SCOPE } from '../../graphql/model/schema/span';
import { ExploreSpecification } from '../../graphql/model/schema/specifications/explore-specification';
import { Specification } from '../../graphql/model/schema/specifier/specification';
import { TraceType } from '../../graphql/model/schema/trace';
import { ExploreSpecificationBuilder } from '../../graphql/request/builders/specification/explore/explore-specification-builder';
import { SpecificationBuilder } from '../../graphql/request/builders/specification/specification-builder';
import { EXPLORE_GQL_REQUEST, GraphQlExploreRequest } from '../../graphql/request/handlers/explore/explore-query';
import {
  GraphQlSpansRequest,
  SPANS_GQL_REQUEST
} from '../../graphql/request/handlers/spans/spans-graphql-query-handler.service';
import {
  GraphQlTracesRequest,
  TRACES_GQL_REQUEST
} from '../../graphql/request/handlers/traces/traces-graphql-query-handler.service';
import { GraphQlFilterBuilderService } from '../../services/filter-builder/graphql-filter-builder.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { CartesianSeriesVisualizationType } from '../cartesian/chart';

@Injectable()
export class ExploreVisualizationBuilder implements OnDestroy {
  private static readonly DEFAULT_LIMIT: number = 1000;

  public readonly visualizationRequest$: Observable<ExploreVisualizationRequest>;
  private readonly destroyed$: Subject<void> = new Subject();
  private readonly queryStateSubject: BehaviorSubject<ExploreRequestState>;
  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly exploreSpecBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public constructor(
    private readonly graphQlFilterBuilderService: GraphQlFilterBuilderService,
    private readonly metadataService: MetadataService,
    private readonly intervalDurationService: IntervalDurationService,
    private readonly timeRangeService: TimeRangeService
  ) {
    this.queryStateSubject = new BehaviorSubject(this.buildDefaultRequest()); // Todo: Revisit first request without knowing the context

    this.visualizationRequest$ = this.queryStateSubject.pipe(
      debounceTime(10),
      map(requestState => this.buildRequest(requestState)),
      takeUntil(this.destroyed$),
      shareReplay(1)
    );
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public reset(): this {
    this.queryStateSubject.next(this.buildDefaultRequest());

    return this;
  }

  public addNewSeries(): this {
    return this.updateState({
      series: [...this.currentState().series, this.buildDefaultSeries(this.currentState().context)]
    });
  }

  public setSeries(newSeries: ExploreSeries[]): this {
    return this.updateState({
      series: [...newSeries]
    });
  }

  public groupBy(groupBy?: GraphQlGroupBy): this {
    return this.updateState({
      groupBy: groupBy
    });
  }

  public orderBy(orderBy?: GraphQlOrderBy): this {
    return this.updateState({
      orderBy: orderBy
    });
  }

  public interval(interval?: TimeDuration | 'AUTO'): this {
    return this.updateState({
      interval: interval
    });
  }

  public filters(filters?: Filter[]): this {
    return this.updateState({
      filters: filters && filters.length > 0 ? filters : undefined
    });
  }

  public context(context?: ExploreRequestContext): this {
    this.queryStateSubject.next(this.buildDefaultRequest(context));

    return this;
  }

  private updateState(stateUpdate: Partial<ExploreRequestState>): this {
    this.queryStateSubject.next({ ...this.currentState(), ...stateUpdate });

    return this;
  }

  private currentState(): ExploreRequestState {
    return this.queryStateSubject.getValue();
  }

  private buildRequest(state: ExploreRequestState): ExploreVisualizationRequest {
    return {
      context: state.context,
      resultLimit: state.resultLimit,
      series: [...state.series],
      filters: state.filters && [...state.filters],
      interval: state.interval,
      groupBy: state.groupBy && { ...state.groupBy },
      orderBy: state.orderBy && { ...state.orderBy },
      exploreQuery$: this.mapStateToExploreQuery(state),
      resultsQuery$: this.mapStateToResultsQuery(state)
    };
  }

  private mapStateToExploreQuery(state: ExploreRequestState): Observable<TimeUnaware<GraphQlExploreRequest>> {
    return this.resolveInterval(state.interval).pipe(
      map(interval => ({
        requestType: EXPLORE_GQL_REQUEST,
        selections: state.series.map(series => series.specification),
        context: state.context,
        interval: interval,
        filters: state.filters && this.graphQlFilterBuilderService.buildGraphQlFieldFilters(state.filters),
        groupBy: state.groupBy,
        orderBy: state.orderBy && this.mapOrderByToGraphQlSpecification(state.orderBy),
        limit: state.resultLimit
      }))
    );
  }

  private mapOrderByToGraphQlSpecification(orderBy: GraphQlOrderBy): GraphQlSortBySpecification[] | undefined {
    return orderBy.keyExpression?.key && orderBy.aggregation && orderBy.direction ? [{
      direction: orderBy.direction,
      key: this.exploreSpecBuilder.exploreSpecificationForKey(orderBy.keyExpression?.key, orderBy.aggregation)
    }] : undefined;
  }

  private mapStateToResultsQuery(
    state: ExploreRequestState
  ): Observable<TimeUnaware<GraphQlSpansRequest> | TimeUnaware<GraphQlTracesRequest>> {
    return this.getResultsQuerySpecificationsFromState(state).pipe(
      map(specifications => this.buildGraphqlRequest(state.context, specifications, state.filters))
    );
  }

  private getResultsQuerySpecificationsFromState(state: ExploreRequestState): Observable<Specification[]> {
    return forkJoinSafeEmpty(
      state.series.map(series => this.metadataService.getAttribute(state.context, series.specification.name))
    ).pipe(
      defaultIfEmpty<AttributeMetadata[]>([]),
      map(attributes =>
        attributes
          .filter(attribute => !attribute.onlySupportsGrouping)
          .map(attribute => this.specBuilder.attributeSpecificationForKey(attribute.name))
      ),
      map(specsFromRequest => uniqBy(specsFromRequest, spec => spec.name))
    );
  }

  private buildGraphqlRequest(
    context: string,
    specifications: Specification[],
    filters?: Filter[]
  ): TimeUnaware<GraphQlSpansRequest> | TimeUnaware<GraphQlTracesRequest> {
    if (context === SPAN_SCOPE) {
      return this.buildSpansGraphqlRequest(specifications, filters);
    }

    return this.buildTracesGraphqlRequest(context, specifications, filters);
  }

  private buildTracesGraphqlRequest(
    traceType: TraceType,
    specifications: Specification[],
    filters?: Filter[]
  ): TimeUnaware<GraphQlTracesRequest> {
    return {
      requestType: TRACES_GQL_REQUEST,
      traceType: traceType,
      properties: specifications,
      limit: 100,
      filters: filters && this.graphQlFilterBuilderService.buildGraphQlFieldFilters(filters)
    };
  }

  private buildSpansGraphqlRequest(
    specifications: Specification[],
    filters?: Filter[]
  ): TimeUnaware<GraphQlSpansRequest> {
    return {
      requestType: SPANS_GQL_REQUEST,
      properties: specifications,
      limit: 100,
      filters: filters && this.graphQlFilterBuilderService.buildGraphQlFieldFilters(filters)
    };
  }

  private buildDefaultRequest(context: ExploreRequestContext = ObservabilityTraceType.Api): ExploreRequestState {
    // Todo: Revisit default value
    return {
      context: context,
      interval: 'AUTO',
      resultLimit: ExploreVisualizationBuilder.DEFAULT_LIMIT,
      series: [this.buildDefaultSeries(context)]
    };
  }

  private buildDefaultSeries(context: string): ExploreSeries {
    const attributeKey = context === SPAN_SCOPE ? 'spans' : 'calls';

    return {
      specification: this.exploreSpecBuilder.exploreSpecificationForKey(attributeKey, MetricAggregationType.Count),
      visualizationOptions: {
        type: CartesianSeriesVisualizationType.Column
      }
    };
  }

  private resolveInterval(interval?: TimeDuration | 'AUTO'): Observable<TimeDuration | undefined> {
    if (interval === 'AUTO') {
      return this.timeRangeService.getTimeRangeAndChanges().pipe(
        map(timeRange => this.intervalDurationService.getAutoDuration(timeRange)),
        distinctUntilChanged(isEqualIgnoreFunctions)
      );
    }

    return of(interval);
  }
}

export interface ExploreRequestState {
  series: ExploreSeries[];
  context: ExploreRequestContext;
  interval?: TimeDuration | 'AUTO';
  filters?: Filter[];
  groupBy?: GraphQlGroupBy;
  orderBy?: GraphQlOrderBy;
  useGroupName?: boolean;
  resultLimit: number;
}

export type ExploreRequestContext = TraceType | 'SPAN' | 'DOMAIN_EVENT';

export interface ExploreVisualizationRequest extends ExploreRequestState {
  exploreQuery$: Observable<TimeUnaware<GraphQlExploreRequest>>;
  resultsQuery$: Observable<TimeUnaware<GraphQlTracesRequest | GraphQlSpansRequest>>;
}

export interface ExploreSeriesVisualizationOptions {
  type: CartesianSeriesVisualizationType;
}

export interface ExploreSeries {
  specification: ExploreSpecification;
  visualizationOptions: ExploreSeriesVisualizationOptions;
}

export interface GraphQlOrderBy {
  aggregation?: MetricAggregationType;
  direction?: GraphQlSortDirection;
  keyExpression?: {
    key: string;
  };
}

type TimeUnaware<T> = Omit<T, 'timeRange'>;
