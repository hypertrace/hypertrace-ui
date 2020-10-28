import { Injectable } from '@angular/core';
import { forkJoinSafeEmpty, NavigationParams, NavigationParamsType } from '@hypertrace/common';
import { Filter, FilterBuilderLookupService } from '@hypertrace/components';
import { MetadataService, SPAN_SCOPE, toFilterAttributeType } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
          map(attribute => ({ ...attribute, type: toFilterAttributeType(attribute.type) })),
          map(
            filterAttribute =>
              this.filterBuilderLookupService
                .lookup(filterAttribute.type)
                .buildFilter(filterAttribute, filter.operator, filter.value).urlString
          )
        )
    );

    return forkJoinSafeEmpty(filterStrings$).pipe(
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

export interface ExplorerFilterNavParams {
  scopeQueryParam: ScopeQueryParam;
  filters: DrilldownFilter[];
}
