import { Type } from '@angular/core';
import { FilterOperator } from '../filter-api';
import { FilterAttributeType } from '../filter-attribute-type';
import { AbstractFilterParser } from './types/abstract-filter-parser';

// tslint:disable-next-line:only-arrow-functions
export function FilterParser(metadata: FilterParserMetadata): FilterParserDecorator {
  return (constructor: FilterParserDecoratorConstructor): void => {
    constructor.supportedAttributeTypes = metadata.supportedAttributeTypes;
    constructor.supportedOperators = metadata.supportedOperators;
  };
}

interface FilterParserMetadata {
  supportedAttributeTypes: FilterAttributeType[];
  supportedOperators: FilterOperator[];
}

interface FilterParserDecoratorConstructor extends Type<AbstractFilterParser>, FilterParserMetadata {}

type FilterParserDecorator = (constructor: FilterParserDecoratorConstructor) => void;
