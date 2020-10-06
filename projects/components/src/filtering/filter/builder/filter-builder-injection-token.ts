import { InjectionToken, Type } from '@angular/core';
import { AbstractFilterBuilder } from './types/abstract-filter-builder';

export type FilterBuilderConstructor<T> = Type<AbstractFilterBuilder<T>>;

export const FILTER_BUILDERS = new InjectionToken<FilterBuilderConstructor<unknown>[]>('FILTER_BUILDERS');
