import { Injectable, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { CustomError } from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, startWith } from 'rxjs/operators';
import { LoadAsyncStateType } from './load-async-state.type';

@Injectable({ providedIn: 'root' })
export class LoadAsyncService {
  public mapObservableState<T>(data$: Observable<T>): Observable<AsyncState<T>> {
    return data$.pipe(
      map(data => this.buildStateForEmittedData<T>(data)),
      defaultIfEmpty(this.buildNoDataState<T>()),
      catchError(error => of(this.buildStateForEmittedError<T>(error))),
      startWith({ type: LoadAsyncStateType.Loading }),
    );
  }

  private buildStateForEmittedData<T>(data: T): AsyncState<T> {
    if (Array.isArray(data) && data.length === 0) {
      return this.buildNoDataState<T>();
    }

    return {
      type: LoadAsyncStateType.Success,
      context: {
        $implicit: data,
        htLoadAsync: data,
      },
    };
  }

  private buildStateForEmittedError<T>(error: Error): AsyncState<T> {
    const asyncState: AsyncState<T> = { type: LoadAsyncStateType.GenericError };
    if (error instanceof CustomError) {
      asyncState.description = error.message;
    }

    return asyncState;
  }

  private buildNoDataState<T>(): AsyncState<T> {
    return {
      type: LoadAsyncStateType.NoData,
    };
  }
}

export interface LoadAsyncContext<T = unknown> {
  htLoadAsync: T;
  $implicit: T;
}

export interface LoadAsyncConfig {
  load?: LoadingStateConfig;
  noData?: NoDataOrErrorStateConfig;
  error?: NoDataOrErrorStateConfig;
}

export type AsyncState<T> = LoadingAsyncState | SuccessAsyncState<T> | NoDataOrErrorAsyncState;

export const enum LoaderType {
  Spinner = 'spinner',
  ExpandableRow = 'expandable-row',
  Page = 'page',
  Rectangle = 'rectangle',
  Text = 'text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item',
  Donut = 'donut',
}

interface LoadingAsyncState {
  type: LoadAsyncStateType.Loading;
}
interface SuccessAsyncState<T> {
  type: LoadAsyncStateType.Success;
  context: LoadAsyncContext<T>;
}

export interface NoDataOrErrorAsyncState {
  type: LoadAsyncStateType.GenericError | LoadAsyncStateType.NoData;
  description?: string;
}

interface LoadingStateConfig {
  loaderType?: LoaderType;
}

export type NoDataOrErrorStateConfig = NoDataOrErrorStateConfigDefault | NoDataOrErrorStateConfigWithCustomTemplate;

export interface NoDataOrErrorStateConfigDefault {
  icon?: IconType;
  showIcon?: boolean;
  title?: string;
  description?: string;
}

export interface NoDataOrErrorStateConfigWithCustomTemplate {
  icon?: IconType;
  showIcon?: boolean;
  template: TemplateRef<LoadAsyncContext>;
}
