import { Type } from '@angular/core';
import { FilterOperator } from '../filter-api';
import { FilterAttributeType } from '../filter-attribute-type';
import { AbstractFilterBuilder } from './types/abstract-filter-builder';

// tslint:disable-next-line:only-arrow-functions
export function FilterBuilder(metadata: FilterBuilderMetadata): FilterBuilderDecorator {
  return (constructor: FilterBuilderDecoratorConstructor): void => {
    constructor.supportedAttributeTypes = metadata.supportedAttributeTypes;
    constructor.supportedOperators = metadata.supportedOperators;
  };
}

interface FilterBuilderMetadata {
  supportedAttributeTypes: FilterAttributeType[];
  supportedOperators: FilterOperator[];
}

interface FilterBuilderDecoratorConstructor extends Type<AbstractFilterBuilder<unknown>>, FilterBuilderMetadata {}

type FilterBuilderDecorator = (constructor: FilterBuilderDecoratorConstructor) => void;
