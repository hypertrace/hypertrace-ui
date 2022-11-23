import { Injectable } from '@angular/core';
import { forkJoinSafeEmpty, NavigationParams, NavigationParamsType, QueryParamObject } from '@hypertrace/common';
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
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {}
  public buildNavParamsWithFilters(
    scopeQueryParam: ScopeQueryParam,
    filters: ExplorerDrilldownFilter[],
    startTime?: Date,
    endTime?: Date
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
                .buildFilter(filterAttribute, filter.operator, filter.value, filter.subpath).urlString
          )
        )
    );

    return forkJoinSafeEmpty(filterStrings$).pipe(
      map(filterStrings => {
        const queryParam: QueryParamObject = {
          filter: filterStrings,
          scope: scopeQueryParam
        };

        return {
          navType: NavigationParamsType.InApp,
          path: '/explorer',
          queryParams:
            !isNil(startTime) && !isNil(endTime)
              ? { ...queryParam, time: `${startTime?.getTime()}` + '-' + `${endTime?.getTime()}` }
              : queryParam
        };
      })
    );
  }
}

export type ExplorerDrilldownFilter = Omit<Filter, 'metadata' | 'userString' | 'urlString'>;
