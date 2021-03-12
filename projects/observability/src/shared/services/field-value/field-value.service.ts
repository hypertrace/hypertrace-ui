import { TimeRange } from './../../../../../common/src/time/time-range';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse
} from './../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreSpecificationBuilder } from './../../graphql/request/builders/specification/explore/explore-specification-builder';
import { switchMap, shareReplay, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { ExploreSpecification } from '../../graphql/model/schema/specifications/explore-specification';
import { GraphQlFilter, GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { TimeRangeService } from '@hypertrace/common';

@Injectable({ providedIn: 'root' })
export class FieldValueService {
  private readonly exploreSpecificationBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public constructor(
    private readonly graphQlRequestService: GraphQlRequestService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public getUniqueValues(
    scope: string,
    field: string,
    filters: GraphQlFilter[] = [],
    limit: number = 10
  ): Observable<string[]> {
    return this.timeRangeService.getTimeRangeAndChanges().pipe(
      switchMap(timeRange => {
        const selections = this.buildExploreSelections(field);
        const exploreRequest = this.buildUniqueValueExploreRequest(scope, selections, timeRange, filters, limit);

        return this.graphQlRequestService.query<ExploreGraphQlQueryHandlerService>(exploreRequest).pipe(
          map((response: GraphQlExploreResponse) =>
            response.results.map(result => result[selections[0].resultAlias()].value as string)
          ),
          shareReplay(1)
        );
      })
    );
  }

  protected buildUniqueValueExploreRequest(
    scope: string,
    selections: ExploreSpecification[],
    timeRange: TimeRange,
    filters: GraphQlFilter[] = [],
    limit: number = 10
  ): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      selections: selections,
      context: scope,
      limit: limit,
      includeTotal: true,
      timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime),
      filters: filters,
      groupBy: {
        keys: [selections[0].name],
        includeRest: false
      }
    };
  }

  private buildExploreSelections(field: string): ExploreSpecification[] {
    return [
      this.exploreSpecificationBuilder.exploreSpecificationForKey(field),
      this.exploreSpecificationBuilder.exploreSpecificationForKey(field, MetricAggregationType.Count)
    ];
  }
}
