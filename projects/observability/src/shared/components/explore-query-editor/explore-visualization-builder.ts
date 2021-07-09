import { Injectable, OnDestroy } from '@angular/core';
import { forkJoinSafeEmpty, IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import {
  AttributeMetadata,
  GraphQlFilterBuilderService,
  GraphQlSpansRequest,
  GraphQlTracesRequest,
  MetadataService,
  MetricAggregationType,
  SPANS_GQL_REQUEST,
  SPAN_SCOPE,
  Specification,
  SpecificationBuilder,
  TRACES_GQL_REQUEST,
  TraceType
} from '@hypertrace/distributed-tracing';
import { uniqBy } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { defaultIfEmpty, map, takeUntil } from 'rxjs/operators';
import { GraphQlGroupBy } from '../../graphql/model/schema/groupby/graphql-group-by';
import { ObservabilityTraceType } from '../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../graphql/request/builders/specification/explore/explore-specification-builder';
import { EXPLORE_GQL_REQUEST, GraphQlExploreRequest } from '../../graphql/request/handlers/explore/explore-query';
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
    private readonly intervalDurationService: IntervalDurationService
  ) {
    this.queryStateSubject = new BehaviorSubject(this.buildDefaultRequest()); // Todo: Revisit first request without knowing the context

    this.visualizationRequest$ = this.queryStateSubject.pipe(
      map(requestState => this.buildRequest(requestState)),
      takeUntil(this.destroyed$)
    );
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public empty(): this {
    return this.reset();
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
      interval: this.resolveInterval(state.interval),
      groupBy: state.groupBy && { ...state.groupBy },
      exploreQuery$: this.mapStateToExploreQuery(state),
      resultsQuery$: this.mapStateToResultsQuery(state)
    };
  }

  private mapStateToExploreQuery(state: ExploreRequestState): Observable<TimeUnaware<GraphQlExploreRequest>> {
    return of({
      requestType: EXPLORE_GQL_REQUEST,
      selections: state.series.map(series => series.specification),
      context: state.context,
      interval: this.resolveInterval(state.interval),
      filters: state.filters && this.graphQlFilterBuilderService.buildGraphQlFilters(state.filters),
      groupBy: state.groupBy,
      limit: state.resultLimit
    });
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
          .filter(attribute => !attribute.onlySupportsAggregation)
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
      filters: filters && this.graphQlFilterBuilderService.buildGraphQlFilters(filters)
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
      filters: filters && this.graphQlFilterBuilderService.buildGraphQlFilters(filters)
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
    const attributeKey = context === SPAN_SCOPE ? 'duration' : 'calls'; // Todo revisit this
    const aggregation = context === SPAN_SCOPE ? MetricAggregationType.Average : MetricAggregationType.Count;

    return {
      specification: this.exploreSpecBuilder.exploreSpecificationForKey(attributeKey, aggregation),
      visualizationOptions: {
        type: CartesianSeriesVisualizationType.Column
      }
    };
  }

  private resolveInterval(interval?: TimeDuration | 'AUTO'): TimeDuration | undefined {
    return interval === 'AUTO' ? this.intervalDurationService.getAutoDuration() : interval;
  }
}

export interface ExploreRequestState {
  series: ExploreSeries[];
  context: ExploreRequestContext;
  interval?: TimeDuration | 'AUTO';
  filters?: Filter[];
  groupBy?: GraphQlGroupBy;
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

type TimeUnaware<T> = Omit<T, 'timeRange'>;
