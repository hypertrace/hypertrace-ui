import { ChangeDetectorRef, Directive, Inject } from '@angular/core';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { WidgetRenderer } from './widget-renderer';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class InteractiveDataWidgetRenderer<TModel extends object, TData = unknown> extends WidgetRenderer<
  TModel,
  TData
> {
  public constructor(@Inject(RENDERER_API) api: RendererApi<TModel>, changeDetector: ChangeDetectorRef) {
    super(api, changeDetector);
  }

  protected abstract buildDataObservable(): Observable<TData>;

  protected updateDataObservable(): void {
    this.data$ = this.buildDataObservable();
  }
}
