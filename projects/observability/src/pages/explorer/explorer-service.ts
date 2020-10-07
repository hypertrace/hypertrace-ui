import { Injectable } from '@angular/core';
import { NavigationParams, NavigationParamsType } from '@hypertrace/common';
import { Filter, toUrlFilterOperator } from '@hypertrace/components';
import { ScopeQueryParam } from './explorer.component';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
  public buildNavParamsWithFilters(scopeQueryParam: ScopeQueryParam, filters: UrlFilter[]): NavigationParams {
    return {
      navType: NavigationParamsType.InApp,
      path: '/explorer',
      queryParams: {
        filter: filters.map(filter => `${filter.urlString}${toUrlFilterOperator(filter.operator)}${filter.value}`),
        scope: scopeQueryParam
      }
    };
  }
}

type UrlFilter = Omit<Filter, 'metadata' | 'field' | 'userString'>;
