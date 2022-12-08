import { Injectable } from '@angular/core';
import {
  ExternalNavigationWindowHandling,
  forkJoinSafeEmpty,
  NavigationParams,
  NavigationParamsType,
  TimeRange,
  TimeRangeService
} from '@hypertrace/common';
import { Filter, FilterBuilderLookupService } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toFilterAttributeType } from '../../shared/graphql/model/metadata/attribute-metadata';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { ScopeQueryParam } from './explorer.component';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly timeRangeService: TimeRangeService
  ) {}
  public buildNavParamsWithFilters(
    scopeQueryParam: ScopeQueryParam,
    filters: ExplorerDrilldownFilter[],
    timeRange?: TimeRange
  ): Observable<NavigationParams> {
    const filterStrings$: Observable<string>[] = this.buildFilterStrings(filters, scopeQueryParam);

    return forkJoinSafeEmpty(filterStrings$).pipe(
      map(filterStrings => ({
        navType: NavigationParamsType.InApp,
        path: '/explorer',
        queryParams: {
          filter: filterStrings,
          scope: scopeQueryParam,
          ...(!isNil(timeRange) ? this.timeRangeService.toQueryParams(timeRange) : {})
        }
      }))
    );
  }

  public buildExternalNavParamsWithFilters(
    scopeQueryParam: ScopeQueryParam,
    filters: ExplorerDrilldownFilter[],
    timeRange?: TimeRange
  ): Observable<NavigationParams> {
    const filterStrings$: Observable<string>[] = this.buildFilterStrings(filters, scopeQueryParam);

    return forkJoinSafeEmpty(filterStrings$).pipe(
      map(filterStrings => ({
        navType: NavigationParamsType.External,
        url:
          '/explorer' +
          `?${this.buildFiltersUrlString(filterStrings)}` +
          `${this.buildScopeUrlString(scopeQueryParam)}` +
          `${!isNil(timeRange) ? `${this.buildTimeRangeUrlString(timeRange)}` : ''}`,
        windowHandling: ExternalNavigationWindowHandling.NewWindow
      }))
    );
  }

  private buildFilterStrings(
    filters: ExplorerDrilldownFilter[],
    scopeQueryParam: ScopeQueryParam
  ): Observable<string>[] {
    return filters.map(filter =>
      this.metadataService
        .getAttribute(
          scopeQueryParam === ScopeQueryParam.EndpointTraces ? ObservabilityTraceType.Api : SPAN_SCOPE,
          filter.field
        )
        .pipe(
          map(attribute => ({ ...attribute, type: toFilterAttributeType(attribute.type) })),
          map(
            filterAttribute =>
              this.filterBuilderLookupService
                .lookup(filterAttribute.type)
                .buildFilter(filterAttribute, filter.operator, filter.value, filter.subpath).urlString
          )
        )
    );
  }

  private buildFiltersUrlString(filterStrings: string[]): string {
    return filterStrings.reduce(
      (acc: string, curr: string) => `${acc}${acc === '' ? 'filter=' : '&filter='}${curr}`,
      ''
    );
  }

  private buildScopeUrlString(scopeQueryParam: ScopeQueryParam): string {
    return `&scope=${scopeQueryParam}`;
  }

  private buildTimeRangeUrlString(timeRange: TimeRange): string {
    return `&time=${timeRange.toUrlString()}`;
  }
}

export type ExplorerDrilldownFilter = Omit<Filter, 'metadata' | 'userString' | 'urlString'>;
