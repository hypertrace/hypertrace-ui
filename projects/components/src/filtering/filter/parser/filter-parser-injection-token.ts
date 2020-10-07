import { InjectionToken, Type } from '@angular/core';
import { AbstractFilterParser } from './types/abstract-filter-parser';

export type FilterParserConstructor<T> = Type<AbstractFilterParser<T>>;

export const FILTER_PARSERS = new InjectionToken<FilterParserConstructor<unknown>[]>('FILTER_PARSERS');
