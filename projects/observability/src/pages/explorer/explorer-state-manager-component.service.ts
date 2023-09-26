import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TimeDurationService } from '@hypertrace/common';
import { isEmpty, isNil } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CartesianSeriesVisualizationType } from '../../shared/components/cartesian/chart';
import {
  ExploreOrderBy,
  ExploreSeries
} from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { SortDirection } from '../../shared/components/explore-query-editor/order-by/explore-query-order-by-editor.component';
import { IntervalValue } from '../../shared/components/interval-select/interval-select.component';
import { AttributeExpression } from '../../shared/graphql/model/attribute/attribute-expression';
import { MetricAggregationType } from '../../shared/graphql/model/metrics/metric-aggregation';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { GraphQlSortDirection } from '../../shared/graphql/model/schema/sort/graphql-sort-direction';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';
import { ContextToggleItem, ExplorerQueryParam, InitialExplorerState, ScopeQueryParam } from './explorer.component';

@Injectable()
export class ExplorerStateManagerComponentService {
  public readonly contextItems: ContextToggleItem[] = [
    {
      label: 'Endpoint Traces',
      value: {
        dashboardContext: ObservabilityTraceType.Api,
        scopeQueryParam: ScopeQueryParam.EndpointTraces
      }
    },
    {
      label: 'Spans',
      value: {
        dashboardContext: SPAN_SCOPE,
        scopeQueryParam: ScopeQueryParam.Spans
      }
    }
  ];

  public refreshStateSubject: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

  public currentState$: Observable<InitialExplorerState>;

  public constructor(private readonly timeDurationService: TimeDurationService, activatedRoute: ActivatedRoute) {
    this.currentState$ = this.refreshStateSubject.asObservable().pipe(
      switchMap(() => activatedRoute.queryParamMap.pipe(take(1))),
      map(paramMap => this.mapToInitialState(paramMap))
    );
  }

  private mapToInitialState(param: ParamMap): InitialExplorerState {
    const series: ExploreSeries[] = param
      .getAll(ExplorerQueryParam.Series)
      .flatMap((seriesString: string) => this.tryDecodeExploreSeries(seriesString));

    const interval: IntervalValue = this.decodeInterval(param.get(ExplorerQueryParam.Interval));

    return {
      contextToggle: this.getOrDefaultContextItemFromQueryParam(param.get(ExplorerQueryParam.Scope) as ScopeQueryParam),
      groupBy: param.has(ExplorerQueryParam.Group)
        ? {
            keyExpressions: param
              .getAll(ExplorerQueryParam.Group)
              .flatMap(expressionString => this.tryDecodeAttributeExpression(expressionString)),
            includeRest: param.get(ExplorerQueryParam.OtherGroup) === 'true',

            limit: parseInt(param.get(ExplorerQueryParam.GroupLimit)!) || 5
          }
        : undefined,
      interval: interval,
      series: series,
      orderBy:
        interval === 'NONE'
          ? this.tryDecodeExploreOrderBy(series[0], param.get(ExplorerQueryParam.Order) ?? undefined)
          : undefined
    };
  }

  private decodeInterval(durationString: string | null): IntervalValue {
    if (isNil(durationString)) {
      return 'AUTO';
    }
    if (durationString === 'NONE') {
      return durationString;
    }

    return this.timeDurationService.durationFromString(durationString) ?? 'AUTO';
  }

  private tryDecodeExploreSeries(seriesString: string): [ExploreSeries] | [] {
    const matches = seriesString.match(/(\w+):(\w+)\((\w+)\)/);
    if (matches?.length !== 4) {
      return [];
    }

    const visualizationType = matches[1] as CartesianSeriesVisualizationType;
    const aggregation = matches[2] as MetricAggregationType;
    const key = matches[3];

    return [
      {
        specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
        visualizationOptions: {
          type: visualizationType
        }
      }
    ];
  }

  private tryDecodeExploreOrderBy(selectedSeries: ExploreSeries, orderByString?: string): ExploreOrderBy {
    const matches = orderByString?.match(/(\w+)\((\w+)\):(\w+)/);

    if (matches?.length !== 4) {
      return {
        aggregation: selectedSeries.specification.aggregation as MetricAggregationType,
        direction: SortDirection.Desc,
        attribute: {
          key: selectedSeries.specification.name
        }
      };
    }

    return {
      aggregation: matches[1] as MetricAggregationType,
      direction: matches[3] as GraphQlSortDirection,
      attribute: {
        key: matches[2]
      }
    };
  }

  private tryDecodeAttributeExpression(expressionString: string): [AttributeExpression] | [] {
    const [key, subpath] = expressionString.split('__');

    return [{ key: key, ...(!isEmpty(subpath) ? { subpath: subpath } : {}) }];
  }

  private getOrDefaultContextItemFromQueryParam(value?: ScopeQueryParam): ContextToggleItem {
    return this.contextItems.find(item => value === item.value.scopeQueryParam) || this.contextItems[0];
  }
}
