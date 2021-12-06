import { Injectable } from '@angular/core';
import { areCompatibleFilters, areEqualFilters, Filter } from '../filter/filter';

@Injectable({
  providedIn: 'root'
})
export class FilterBarService {
  public addFilter(filters: Filter[], filter: Filter): Filter[] {
    const remainingFilters = filters.filter(f => areCompatibleFilters(f, filter));

    return [...remainingFilters, filter];
  }

  public updateFilter(filters: Filter[], oldFilter: Filter, newFilter: Filter): Filter[] {
    const clonedFilters = [...filters];

    const index = filters.findIndex(f => areEqualFilters(f, oldFilter));

    if (index < 0) {
      throw new Error(`Unable to update filter. Filter for '${oldFilter.field}' not found.`);
    }

    clonedFilters.splice(index, 1, newFilter);

    return clonedFilters.filter(f => areEqualFilters(f, newFilter) || areCompatibleFilters(f, newFilter));
  }

  public deleteFilter(filters: Filter[], filter: Filter): Filter[] {
    return filters.filter(f => !areEqualFilters(f, filter));
  }
}
