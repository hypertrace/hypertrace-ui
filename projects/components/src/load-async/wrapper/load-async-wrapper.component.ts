import { ChangeDetectionStrategy, Component, Inject, InjectionToken, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IconSize } from '../../icon/icon-size';
import { NotificationMode } from '../../notification/notification.component';
import { LoadAsyncStateType } from '../load-async-state.type';
import {
  AsyncState,
  LoadAsyncConfig,
  LoadAsyncContext,
  LoaderType,
  NoDataOrErrorAsyncState,
  NoDataOrErrorStateConfig,
  NoDataOrErrorStateConfigWithCustomTemplate
} from '../load-async.service';

export const ASYNC_WRAPPER_PARAMETERS$ = new InjectionToken<Observable<LoadAsyncWrapperParameters<unknown>>>(
  'ASYNC_WRAPPER_PARAMETERS$'
);

@Component({
  selector: 'ht-load-async-wrapper',
  template: `
    <div *ngIf="this.state$ | async as state" class="fill-container" [ngSwitch]="state.type">
      <ng-container *ngSwitchCase="'${LoadAsyncStateType.Loading}'">
        <ht-loader [loaderType]="this.loaderType"></ht-loader>
      </ng-container>
      <ng-container *ngSwitchCase="'${LoadAsyncStateType.Success}'">
        <ng-container *ngTemplateOutlet="this.content; context: state.context"></ng-container>
      </ng-container>
      <ng-container *ngSwitchDefault>
        <ng-container *ngIf="this.customNoDataOrErrorTemplate; else defaultMessageDisplayTpl">
          <div class="custom-templated-message">
            <div class="content">
              <ht-icon *ngIf="this.icon" [icon]="this.icon" size="${IconSize.Large}"></ht-icon>
              <ng-container *ngTemplateOutlet="this.customNoDataOrErrorTemplate; context: state.context"></ng-container>
            </div>
          </div>
        </ng-container>
        <ng-template #defaultMessageDisplayTpl>
          <ht-message-display
            aria-live="polite"
            role="alert"
            [attr.data-alert-type]="
              state.type === '${LoadAsyncStateType.GenericError}'
                ? '${NotificationMode.Failure}'
                : '${NotificationMode.Info}'
            "
            [icon]="this.icon"
            [title]="this.title"
            [description]="this.description"
          ></ht-message-display>
        </ng-template>
      </ng-container>
    </div>
  `,
  styleUrls: ['./load-async-wrapper.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadAsyncWrapperComponent<T = unknown> {
  public readonly state$: Observable<AsyncState<T>>;

  public icon?: IconType;
  public loaderType?: LoaderType;
  public title?: string;
  public description: string = '';

  public content?: TemplateRef<LoadAsyncContext>;
  public config?: LoadAsyncConfig;
  public customNoDataOrErrorTemplate?: TemplateRef<LoadAsyncContext>;

  public constructor(@Inject(ASYNC_WRAPPER_PARAMETERS$) parameters$: Observable<LoadAsyncWrapperParameters<T>>) {
    this.state$ = parameters$.pipe(
      tap(params => {
        this.content = params.content;
        this.config = params.config;
      }),
      switchMap(parameter => parameter.state$),
      tap(state => this.updateMessage(state))
    );
  }

  private updateMessage(state: AsyncState<T>): void {
    switch (state.type) {
      case LoadAsyncStateType.Loading:
        this.loaderType = this.config?.load?.loaderType;
        break;
      case LoadAsyncStateType.NoData:
        this.setPropsForNoDataState();
        break;
      case LoadAsyncStateType.GenericError:
        this.setPropsForErrorState(state);
        break;
      default:
        this.icon = undefined;
        this.title = '';
        this.description = '';
        this.customNoDataOrErrorTemplate = undefined;
    }
  }

  private setPropsForErrorState(state: NoDataOrErrorAsyncState): void {
    this.icon = this.showErrorIcon() ? this.getErrorIcon() : undefined;
    if (this.isTemplateBasedConfig(this.config?.error)) {
      this.customNoDataOrErrorTemplate = this.config.error.template;
    } else {
      this.title = this.config?.error?.title ?? 'Error';
      this.description = state.description ?? this.config?.error?.description ?? '';
      this.customNoDataOrErrorTemplate = undefined;
    }
  }

  private setPropsForNoDataState(): void {
    this.icon = this.showNoDataIcon() ? this.getNoDataIcon() : undefined;
    if (this.isTemplateBasedConfig(this.config?.noData)) {
      this.customNoDataOrErrorTemplate = this.config.noData.template;
    } else {
      this.title = this.config?.noData?.title ?? 'No Data';
      this.description = this.config?.noData?.description ?? '';
      this.customNoDataOrErrorTemplate = undefined;
    }
  }

  private getNoDataIcon(): IconType {
    return this.config?.noData?.icon ?? IconType.NoData;
  }

  private getErrorIcon(): IconType {
    return this.config?.error?.icon ?? IconType.Error;
  }

  private showNoDataIcon(): boolean {
    return this.config?.noData?.showIcon ?? true;
  }

  private showErrorIcon(): boolean {
    return this.config?.error?.showIcon ?? true;
  }

  private isTemplateBasedConfig(
    config?: NoDataOrErrorStateConfig
  ): config is NoDataOrErrorStateConfigWithCustomTemplate {
    return !isNil(config) && 'template' in config && !isNil(config.template);
  }
}

export interface LoadAsyncWrapperParameters<T> {
  state$: Observable<AsyncState<T>>;
  content: TemplateRef<LoadAsyncContext<T>>;
  config?: LoadAsyncConfig;
}
