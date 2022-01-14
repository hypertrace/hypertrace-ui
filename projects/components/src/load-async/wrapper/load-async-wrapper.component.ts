import { ChangeDetectionStrategy, Component, Inject, InjectionToken, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { LoadAsyncStateType } from '../load-async-state.type';
import { AsyncState, LoadAsyncConfig, LoadAsyncContext, LoaderType } from '../load-async.service';

export const ASYNC_WRAPPER_PARAMETERS$ = new InjectionToken<Observable<LoadAsyncWrapperParameters>>(
  'ASYNC_WRAPPER_PARAMETERS$'
);

@Component({
  selector: 'ht-load-async-wrapper',
  template: `
    <div *ngIf="this.state$ | async as state" class="fill-container" [ngSwitch]="state.type">
      <ng-container *ngSwitchCase="'${LoadAsyncStateType.Loading}'">
        <ht-loader [loaderType]="this.loaderType" [repeatLoaderCount]="this.config?.load?.repeatCount"></ht-loader>
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
  public loaderType?: LoaderType;
  public title?: string;
  public description: string = '';

  public content?: TemplateRef<LoadAsyncContext>;
  public config?: LoadAsyncConfig;

  public constructor(@Inject(ASYNC_WRAPPER_PARAMETERS$) parameters$: Observable<LoadAsyncWrapperParameters>) {
    this.state$ = parameters$.pipe(
      tap(params => {
        this.content = params.content;
        this.config = params.config;
      }),
      switchMap(parameter => parameter.state$),
      tap(state => this.updateMessage(state))
    );
  }

  private updateMessage(state: AsyncState): void {
    switch (state.type) {
      case LoadAsyncStateType.Loading:
        this.loaderType = this.config?.load?.loaderType;
        break;
      case LoadAsyncStateType.NoData:
        this.icon = this.config?.noData?.icon ?? IconType.NoData;
        this.title = this.config?.noData?.title ?? 'No Data';
        this.description = this.config?.noData?.description ?? '';
        break;
      case LoadAsyncStateType.GenericError:
        this.icon = this.config?.error?.icon ?? IconType.Error;
        this.title = this.config?.error?.title ?? 'Error';
        this.description = state.description ?? this.config?.error?.description ?? '';
        break;
      default:
        this.icon = undefined;
        this.title = '';
        this.description = '';
    }
  }
}

export interface LoadAsyncWrapperParameters {
  state$: Observable<AsyncState>;
  content: TemplateRef<LoadAsyncContext>;
  config?: LoadAsyncConfig;
}
