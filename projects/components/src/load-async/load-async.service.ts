import { Injectable } from '@angular/core';
import { IconType, LoaderType } from '@hypertrace/assets-library';
import { CustomError } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, startWith } from 'rxjs/operators';
import { LoadAsyncStateType } from './load-async-state.type';

@Injectable({ providedIn: 'root' })
export class LoadAsyncService {
  public mapObservableState(data$: Observable<unknown>, config?: LoadAsyncConfig): Observable<AsyncState> {
    return data$.pipe(
      map(data => this.buildStateForEmittedData(data)),
      defaultIfEmpty(this.buildNoDataState()),
      catchError(error => of(this.buildStateForEmittedError(error))),
      map(data => this.mapConfigsForLoadAsyncState(data, config)),
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
    const asyncState: AsyncState = { type: LoadAsyncStateType.GenericError, config: {} };
    if (error instanceof CustomError) {
      asyncState.config!.description = error.message;
    }

    return asyncState;
  }

  private buildNoDataState(): AsyncState {
    return {
      type: LoadAsyncStateType.NoData
    };
  }

  private mapConfigsForLoadAsyncState(data: AsyncState, config?: LoadAsyncConfig): AsyncState {
    if (isEmpty(config) || data.type === LoadAsyncStateType.Success) {
      return data;
    }
    const asyncState: AsyncState = { ...data };
    switch (data.type) {
      case LoadAsyncStateType.Loading:
        asyncState.config = config?.load;
        break;
      case LoadAsyncStateType.NoData:
        asyncState.config = config?.noData;
        break;
      case LoadAsyncStateType.GenericError:
        asyncState.config = config?.error;
        break;
      default:
        return asyncState;
    }

    return asyncState;
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

interface LoadingAsyncState {
  type: LoadAsyncStateType.Loading;
  config?: LoadingStateConfig;
}
interface SuccessAsyncState {
  type: LoadAsyncStateType.Success;
  context?: LoadAsyncContext;
}

interface NoDataOrErrorAsyncState {
  type: LoadAsyncStateType.NoData | LoadAsyncStateType.GenericError;
  config?: NoDataOrErrorStateConfig;
}

interface LoadingStateConfig {
  looaderType?: LoaderType;
}

interface NoDataOrErrorStateConfig {
  icon?: IconType;
  title?: string;
  description?: string;
}
