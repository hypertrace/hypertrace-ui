import { Injectable } from '@angular/core';
import { NavigationService, TimeDurationService } from '@hypertrace/common';
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
import { GraphQlSortDirection } from '../../shared/graphql/model/schema/sort/graphql-sort-direction';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';
import { ExplorerQueryParam, ScopeQueryParam } from './explorer.component';

@Injectable({ providedIn: 'root' })
export class ExplorerUrlParserService {
  public constructor(
    private readonly timeDurationService: TimeDurationService,
    private readonly navigationService: NavigationService
  ) {}

  public tryDecodeExploreSeries(seriesString: string): [ExploreSeries] | [] {
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

  public tryDecodeExploreOrderBy(selectedSeries: ExploreSeries, orderByString?: string): ExploreOrderBy {
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

  public decodeInterval(durationString?: string | null): IntervalValue {
    if (isNil(durationString)) {
      return 'AUTO';
    }
    if (durationString === 'NONE') {
      return durationString;
    }

    return this.timeDurationService.durationFromString(durationString) ?? 'AUTO';
  }

  public tryDecodeAttributeExpression(expressionString: string): [AttributeExpression] | [] {
    const [key, subpath] = expressionString.split('__');

    return [{ key: key, ...(!isEmpty(subpath) ? { subpath: subpath } : {}) }];
  }

  public extractExplorerQueryFromUrl(): ExplorerQuery {
    const interval = this.navigationService.getQueryParameter(ExplorerQueryParam.Interval, '');
    const includeOtherGroups = this.navigationService.getQueryParameter(ExplorerQueryParam.OtherGroup, '');
    const groupLimit = this.navigationService.getQueryParameter(ExplorerQueryParam.GroupLimit, '');

    return {
      scope: this.navigationService.getQueryParameter(ExplorerQueryParam.Scope, 'endpoint-trace') as ScopeQueryParam,
      queryClauses: {
        selection: this.navigationService.getAllValuesForQueryParameter(ExplorerQueryParam.Series),
        interval: !isEmpty(interval) ? interval : undefined,
        orderBy: this.navigationService.getAllValuesForQueryParameter(ExplorerQueryParam.Order),
        groupBy: this.navigationService.getAllValuesForQueryParameter(ExplorerQueryParam.Group),
        includeOtherGroups: !isEmpty(includeOtherGroups) ? includeOtherGroups : undefined,
        groupLimit: !isEmpty(groupLimit) ? groupLimit : undefined,
        filter: this.navigationService.getAllValuesForQueryParameter(ExplorerQueryParam.Filters)
      }
    };
  }
}

export interface ExplorerQuery {
  scope: ScopeQueryParam;
  queryClauses: ExplorerQueryClauses;
}
export interface ExplorerQueryClauses {
  selection: string[];
  filter: string[];
  groupBy: string[];
  orderBy: string[];
  groupLimit?: string;
  includeOtherGroups?: string;
  interval?: string;
}
