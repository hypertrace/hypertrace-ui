import { ChangeDetectionStrategy, Component, Inject, InjectionToken, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { LoadAsyncStateType } from '../load-async-state.type';
import { AsyncState, ErrorAsyncState, LoadAsyncContext } from '../load-async.service';

export const ASYNC_WRAPPER_PARAMETERS$ = new InjectionToken<Observable<LoadAsyncWrapperParameters>>(
  'ASYNC_WRAPPER_PARAMETERS$'
);

@Component({
  selector: 'ht-load-async-wrapper',
  template: `
    <div *ngIf="this.state$ | async as state" class="fill-container" [ngSwitch]="state.type">
      <ng-container *ngSwitchCase="'${LoadAsyncStateType.Loading}'">
        <ht-loader></ht-loader>
      </ng-container>
      <ng-container *ngSwitchCase="'${LoadAsyncStateType.Success}'">
        <ng-container *ngTemplateOutlet="this.content; context: state.context"></ng-container>
      </ng-container>
      <ng-container *ngSwitchDefault>
        <ht-message-display
          [icon]="this.icon"
          [title]="this.title"
          [description]="this.description"
        ></ht-message-display>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadAsyncWrapperComponent {
  public readonly state$: Observable<AsyncState>;

  public icon?: IconType;
  public title?: string;
  public description: string = '';

  public content?: TemplateRef<LoadAsyncContext>;

  public constructor(@Inject(ASYNC_WRAPPER_PARAMETERS$) parameters$: Observable<LoadAsyncWrapperParameters>) {
    this.state$ = parameters$.pipe(
      tap(params => (this.content = params.content)),
      switchMap(parameter => parameter.state$),
      tap(state => this.updateMessage(state.type, state.message, (state as Partial<ErrorAsyncState>).description))
    );
  }

  private updateMessage(stateType: LoadAsyncStateType, message?: string, description: string = ''): void {
    this.description = description;

    switch (stateType) {
      case LoadAsyncStateType.NoData:
        this.icon = IconType.NoData;
        this.title = message ?? 'No Data';
        break;
      case LoadAsyncStateType.GenericError:
      default:
        this.icon = IconType.Error;
        this.title = message ?? 'Error';
    }
  }
}

export interface LoadAsyncWrapperParameters {
  state$: Observable<AsyncState>;
  content: TemplateRef<LoadAsyncContext>;
}
