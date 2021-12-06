import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, endWith, ignoreElements, startWith } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-spinner',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="spinner"
      *ngIf="this.state$ | async as state"
      [ngSwitch]="state"
      [ngClass]="{
        'dark-theme': this.theme === '${SpinnerTheme.Dark}',
        'light-theme': this.theme === '${SpinnerTheme.Light}'
      }"
    >
      <ng-container *ngSwitchCase="'${SpinnerAsyncState.Success}'">
        <ht-icon class="success-icon" icon="${IconType.Done}" size="${IconSize.Small}"></ht-icon>
        <ht-label [label]="this.successLabel" class="label"></ht-label>
      </ng-container>
      <ng-container *ngSwitchCase="'${SpinnerAsyncState.Error}'">
        <ht-icon class="error-icon" icon="${IconType.Error}" size="${IconSize.Small}"></ht-icon>
        <ht-label [label]="this.errorLabel" class="label"></ht-label>
      </ng-container>
      <ng-container *ngSwitchDefault>
        <ht-icon class="loading-icon" icon="${IconType.Spinner}" size="${IconSize.Small}"></ht-icon>
        <ht-label [label]="this.loadingLabel" class="label"></ht-label>
      </ng-container>
    </div>
  `
})
export class SpinnerComponent implements OnChanges {
  @Input()
  public data$?: Observable<unknown>;

  @Input()
  public loadingLabel: string = '';

  @Input()
  public errorLabel: string = '';

  @Input()
  public successLabel: string = '';

  @Input()
  public theme: SpinnerTheme = SpinnerTheme.Light;

  public state$: Observable<SpinnerAsyncState> = of(SpinnerAsyncState.Loading);

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data$) {
      this.state$ = this.mapObservableState(this.data$ ?? NEVER);
    }
  }

  private mapObservableState(data$: Observable<unknown>): Observable<SpinnerAsyncState> {
    return data$.pipe(
      ignoreElements(),
      startWith(SpinnerAsyncState.Loading),
      endWith(SpinnerAsyncState.Success),
      catchError(() => of(SpinnerAsyncState.Error))
    );
  }
}

export const enum SpinnerTheme {
  Dark = 'dark',
  Light = 'light'
}

export const enum SpinnerAsyncState {
  Loading = 'loading',
  Error = 'error',
  Success = 'success'
}
