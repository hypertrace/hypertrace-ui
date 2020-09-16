import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LoadAsyncContext, LoadAsyncService } from './load-async.service';
import {
  ASYNC_WRAPPER_PARAMETERS$,
  LoadAsyncWrapperComponent,
  LoadAsyncWrapperParameters
} from './wrapper/load-async-wrapper.component';

@Directive({
  selector: '[htLoadAsync]'
})
export class LoadAsyncDirective implements OnChanges, OnDestroy {
  @Input('htLoadAsync')
  public data$?: Observable<unknown>;
  private readonly wrapperParamsSubject: ReplaySubject<LoadAsyncWrapperParameters> = new ReplaySubject(1);
  private readonly wrapperInjector: Injector;
  private wrapperView?: ComponentRef<LoadAsyncWrapperComponent>;

  public constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly loadAsyncService: LoadAsyncService,
    public readonly templateRef: TemplateRef<LoadAsyncContext>
  ) {
    this.wrapperInjector = Injector.get(
      this.viewContainer.injector,
      new WeakMap([[ASYNC_WRAPPER_PARAMETERS$, this.wrapperParamsSubject.asObservable()]])
    );
  }

  public ngOnChanges(): void {
    if (this.data$) {
      this.wrapperView = this.wrapperView || this.buildWrapperView();
      this.wrapperParamsSubject.next({
        state$: this.loadAsyncService.mapObservableState(this.data$),
        content: this.templateRef
      });
    } else {
      // If observable is cleared, clear the DOM
      this.viewContainer.clear();
      this.wrapperView = undefined;
    }
  }

  public ngOnDestroy(): void {
    this.wrapperParamsSubject.complete();
  }

  private buildWrapperView(): ComponentRef<LoadAsyncWrapperComponent> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(LoadAsyncWrapperComponent);

    return this.viewContainer.createComponent(componentFactory, undefined, this.wrapperInjector);
  }
}
