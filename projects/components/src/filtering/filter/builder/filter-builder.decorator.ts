import { Type } from '@angular/core';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterOperator } from '../filter-operators';
import { AbstractFilterBuilder } from './types/abstract-filter-builder';

// tslint:disable-next-line:only-arrow-functions
export function FilterBuilder(metadata: FilterBuilderMetadata): FilterBuilderDecorator {
  return (constructor: FilterBuilderDecoratorConstructor): void => {
    constructor.supportedAttributeType = metadata.supportedAttributeType;
    constructor.supportedOperators = metadata.supportedOperators;
  };
}

interface FilterBuilderMetadata {
  supportedAttributeType: FilterAttributeType;
  supportedOperators: FilterOperator[];
}

interface FilterBuilderDecoratorConstructor extends Type<AbstractFilterBuilder<unknown>>, FilterBuilderMetadata {}

type FilterBuilderDecorator = (constructor: FilterBuilderDecoratorConstructor) => void;
