import { Injectable } from '@angular/core';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterBuilderConstructor } from './filter-builder-injection-token';
import { AbstractFilterBuilder } from './types/abstract-filter-builder';

@Injectable({
  providedIn: 'root'
})
export class FilterBuilderLookupService {
  private readonly filterBuilders: Map<FilterAttributeType, AbstractFilterBuilder<unknown>> = new Map();

  public registerAll(filterBuilderConstructors: FilterBuilderConstructor<unknown>[]): void {
    filterBuilderConstructors.forEach(filterBuilderConstructor => {
      const filterBuilder = new filterBuilderConstructor();
      this.filterBuilders.set(filterBuilder.supportedAttributeType(), filterBuilder);
    });
  }

  public lookup(type: FilterAttributeType): AbstractFilterBuilder<unknown> {
    const filterBuilder = this.filterBuilders.get(type);

    if (filterBuilder === undefined) {
      throw new Error(`Filter builder not found for attribute of type '${type}'.
      Available builders are '${String(Array.from(this.filterBuilders.keys()))}'`);
    }

    return filterBuilder;
  }

  public isBuildableType(type: FilterAttributeType): boolean {
    try {
      this.lookup(type);

      return true;
    } catch (e) {
      return false;
    }
  }
}
