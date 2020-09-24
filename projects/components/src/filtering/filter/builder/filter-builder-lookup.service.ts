import { Injectable } from '@angular/core';
import { FilterAttribute } from '../filter-attribute';
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

  public lookup(attribute: FilterAttribute): AbstractFilterBuilder<unknown> {
    const filterBuilder = this.filterBuilders.get(attribute.type);

    if (filterBuilder === undefined) {
      throw new Error(`Filter builder not found for attribute '${attribute.name}' of type '${attribute.type}'`);
    }

    return filterBuilder;
  }

  public isSupportedType(attribute: FilterAttribute): boolean {
    try {
      this.lookup(attribute);

      return true;
    } catch (e) {
      return false;
    }
  }
}
