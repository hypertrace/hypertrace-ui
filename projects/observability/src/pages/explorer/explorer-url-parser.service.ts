import { Injectable } from '@angular/core';
import { TimeDurationService } from '@hypertrace/common';
import { isEmpty, isNil } from 'lodash-es';
import { CartesianSeriesVisualizationType } from '../../shared/components/cartesian/chart';
import {
  ExploreOrderBy,
  ExploreSeries
} from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { SortDirection } from '../../shared/components/explore-query-editor/order-by/explore-query-order-by-editor.component';
import { IntervalValue } from '../../shared/components/interval-select/interval-select.component';
import { AttributeExpression } from '../../shared/graphql/model/attribute/attribute-expression';
import { MetricAggregationType } from '../../shared/graphql/model/metrics/metric-aggregation';
import { GraphQlGroupBy } from '../../shared/graphql/model/schema/groupby/graphql-group-by';
import { GraphQlSortDirection } from '../../shared/graphql/model/schema/sort/graphql-sort-direction';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';

@Injectable({ providedIn: 'root' })
export class ExplorerUrlParserService {
  public constructor(private readonly timeDurationService: TimeDurationService) {}

  public getExplorerState(query: ExplorerQuery): ExplorerState {
    const series: ExploreSeries[] = this.getExplorerSeries(query.series);
    const interval: IntervalValue = this.decodeInterval(query.interval);

    return {
      series: series,
      interval: interval,
      orderBy: interval === 'NONE' ? this.tryDecodeExploreOrderBy(series[0], query.orderBy?.[0]) : undefined,
      ...(!isEmpty(query.groupBy)
        ? {
            groupBy: this.tryDecodeExploreGroupBy(query.groupBy!, query.groupLimit!, query.includeOtherGroups)
          }
        : {})
    };
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

  private decodeInterval(durationString?: string | null): IntervalValue {
    if (isNil(durationString)) {
      return 'AUTO';
    }
    if (durationString === 'NONE') {
      return durationString;
    }

    return this.timeDurationService.durationFromString(durationString) ?? 'AUTO';
  }

  private tryDecodeAttributeExpression(expressionString: string): [AttributeExpression] | [] {
    const [key, subpath] = expressionString.split('__');

    return [{ key: key, ...(!isEmpty(subpath) ? { subpath: subpath } : {}) }];
  }

  private getExplorerSeries(series: string[]): ExploreSeries[] {
    return series.flatMap((seriesString: string) => this.tryDecodeExploreSeries(seriesString));
  }

  private tryDecodeExploreGroupBy(groupBys: string[], groupLimit: string, includeOtherGroups?: string): GraphQlGroupBy {
    return {
      keyExpressions: groupBys.flatMap(expressionString => this.tryDecodeAttributeExpression(expressionString)),
      includeRest: !isNil(includeOtherGroups) && includeOtherGroups === 'true' ? true : undefined,
      limit: Number(groupLimit)
    };
  }
}

export interface ExplorerQuery {
  series: string[];
  interval?: string;
  groupBy?: string[];
  groupLimit?: string;
  includeOtherGroups?: string;
  orderBy?: string[];
}

export interface ExplorerState {
  series: ExploreSeries[];
  interval: IntervalValue;
  groupBy?: GraphQlGroupBy;
  orderBy?: ExploreOrderBy;
}
