import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from '../filter-attribute-type';
import { AbstractFilterBuilder } from './types/abstract-filter-builder';
import { BooleanFilterBuilder } from './types/boolean-filter-builder';
import { NumberFilterBuilder } from './types/number-filter-builder';
import { StringFilterBuilder } from './types/string-filter-builder';
import { StringMapFilterBuilder } from './types/string-map-filter-builder';

@Injectable({
  providedIn: 'root'
})
export class FilterBuilderLookupService {
  public lookup(type: FilterAttributeType): AbstractFilterBuilder<unknown> {
    switch (type) {
      case FilterAttributeType.Boolean:
        return new BooleanFilterBuilder();
      case FilterAttributeType.Number:
        return new NumberFilterBuilder();
      case FilterAttributeType.String:
        return new StringFilterBuilder();
      case FilterAttributeType.StringMap:
        return new StringMapFilterBuilder();
      case FilterAttributeType.StringArray: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        throw new Error(`Filter builder not found for attribute of type '${type}'.`);
      default:
        assertUnreachable(type);
    }
    throw new Error(`Filter builder not found for attribute of type '${type}'.`);
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
