import { Injectable } from '@angular/core';
import { FilterAttribute } from '../../filter-attribute';
import { AbstractFilterBuilder } from './abstract-filter-builder';
import { FilterBuilderConstructor } from './filter-builder';

@Injectable({
  providedIn: 'root'
})
export class FilterBuilderService {
  private readonly filterBuilders: Map<string, AbstractFilterBuilder<unknown>> = new Map();

  public registerAll(filterBuilderConstructors: FilterBuilderConstructor<unknown>[]): void {
    filterBuilderConstructors.forEach(filterBuilderConstructor => {
      const filterBuilder = new filterBuilderConstructor();
      this.filterBuilders.set(filterBuilder.supportedValue(), filterBuilder);
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
