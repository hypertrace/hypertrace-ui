import { Injectable } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { CustomError } from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, startWith } from 'rxjs/operators';
import { LoadAsyncStateType } from './load-async-state.type';

@Injectable({ providedIn: 'root' })
export class LoadAsyncService {
  public mapObservableState(data$: Observable<unknown>): Observable<AsyncState> {
    return data$.pipe(
      map(data => this.buildStateForEmittedData(data)),
      defaultIfEmpty(this.buildNoDataState()),
      catchError(error => of(this.buildStateForEmittedError(error))),
      startWith({ type: LoadAsyncStateType.Loading })
    );
  }

  private buildStateForEmittedData(data: unknown): AsyncState {
    if (Array.isArray(data) && data.length === 0) {
      return this.buildNoDataState();
    }

    return {
      type: LoadAsyncStateType.Success,
      context: {
        $implicit: data,
        htLoadAsync: data
      }
    };
  }

  private buildStateForEmittedError(error: Error): AsyncState {
    const asyncState: AsyncState = { type: LoadAsyncStateType.GenericError };
    if (error instanceof CustomError) {
      asyncState.description = error.message;
    }

    return asyncState;
  }

  private buildNoDataState(): AsyncState {
    return {
      type: LoadAsyncStateType.NoData
    };
  }
}

export interface LoadAsyncContext {
  htLoadAsync: unknown;
  $implicit: unknown;
}

export interface LoadAsyncConfig {
  load?: LoadingStateConfig;
  noData?: NoDataOrErrorStateConfig;
  error?: NoDataOrErrorStateConfig;
}

export type AsyncState = LoadingAsyncState | SuccessAsyncState | NoDataOrErrorAsyncState;

export const enum LoaderType {
  Rectangle = 'rectangle',
  Text = 'text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item',
  Donut = 'donut',
  Page = 'page',
  Cartesian = 'cartesian',
  CartesianColumn = 'cartesian-column',
  Radar = 'radar',
  Topology = 'topology',
  None = 'none'
}

interface LoadingAsyncState {
  type: LoadAsyncStateType.Loading;
}
interface SuccessAsyncState {
  type: LoadAsyncStateType.Success;
  context: LoadAsyncContext;
}

interface NoDataOrErrorAsyncState {
  type: LoadAsyncStateType.GenericError | LoadAsyncStateType.NoData;
  description?: string;
}

interface LoadingStateConfig {
  loaderType?: LoaderType;
}

interface NoDataOrErrorStateConfig {
  icon?: IconType;
  title?: string;
  description?: string;
}
