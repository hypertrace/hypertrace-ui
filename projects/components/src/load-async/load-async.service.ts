import { Injectable } from '@angular/core';
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

export type AsyncState = ErrorAsyncState | SuccessAsyncState | LoadingAsyncState;

interface LoadingAsyncState {
  type: LoadAsyncStateType.Loading;
}

interface SuccessAsyncState {
  type: LoadAsyncStateType.Success;
  context: LoadAsyncContext;
}

export interface ErrorAsyncState {
  type: LoadAsyncStateType.GenericError | LoadAsyncStateType.NoData;
  description?: string;
}
