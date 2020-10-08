import { Injectable } from '@angular/core';
import { NavigationParams, NavigationParamsType } from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import { MetadataService, SPAN_SCOPE, toFilterType } from '@hypertrace/distributed-tracing';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBuilderLookupService } from '../../../../components/src/filtering/filter/builder/filter-builder-lookup.service';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { ScopeQueryParam } from './explorer.component';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {}
  public buildNavParamsWithFilters(
    scopeQueryParam: ScopeQueryParam,
    filters: DrilldownFilter[]
  ): Observable<NavigationParams> {
    const filterStrings$: Observable<string>[] = filters.map(filter =>
      this.metadataService
        .getAttribute(
          scopeQueryParam === ScopeQueryParam.EndpointTraces ? ObservabilityTraceType.Api : SPAN_SCOPE,
          filter.field
        )
        .pipe(
          map(attribute => ({ ...attribute, type: toFilterType(attribute.type) })),
          map(
            filterAttribute =>
              this.filterBuilderLookupService
                .lookup(filterAttribute.type)
                .buildFilter(filterAttribute, filter.operator, filter.value).urlString
          )
        )
    );

    return combineLatest(filterStrings$).pipe(
      map(filterStrings => ({
        navType: NavigationParamsType.InApp,
        path: '/explorer',
        queryParams: {
          filter: filterStrings,
          scope: scopeQueryParam
        }
      }))
    );
  }
}

type DrilldownFilter = Omit<Filter, 'metadata' | 'userString' | 'urlString'>;
