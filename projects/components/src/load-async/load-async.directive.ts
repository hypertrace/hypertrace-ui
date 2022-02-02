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
import {
  LoadAsyncConfig,
  LoadAsyncContext,
  LoadAsyncService,
  LoadingStateConfig,
  NoDataOrErrorStateConfig
} from './load-async.service';
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

  // tslint:disable-next-line:no-input-rename
  @Input('htLoadAsyncConfig')
  public config?: LoadAsyncConfig;

  @Input('htLoadAsyncLoaderType')
  public loaderType?: LoadingStateConfig;

  @Input('htLoadAsyncNoData')
  public noData?: NoDataOrErrorStateConfig;

  private readonly wrapperParamsSubject: ReplaySubject<LoadAsyncWrapperParameters> = new ReplaySubject(1);
  private readonly wrapperInjector: Injector;
  private wrapperView?: ComponentRef<LoadAsyncWrapperComponent>;

  public constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly loadAsyncService: LoadAsyncService,
    public readonly templateRef: TemplateRef<LoadAsyncContext>
  ) {
    this.wrapperInjector = Injector.create({
      providers: [
        {
          provide: ASYNC_WRAPPER_PARAMETERS$,
          useValue: this.wrapperParamsSubject.asObservable()
        }
      ],
      parent: this.viewContainer.injector
    });
  }

  public ngOnChanges(): void {
    this.config = this.buildLoadingConfig();
    if (this.data$) {
      this.wrapperView = this.wrapperView || this.buildWrapperView();
      this.wrapperParamsSubject.next({
        state$: this.loadAsyncService.mapObservableState(this.data$),
        content: this.templateRef,
        config: this.config
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

  public buildLoadingConfig(): LoadAsyncConfig {
    return {
      noData: this.noData ?? this.config?.noData,
      load: this.loaderType ?? this.config?.load
    };
  }

  private buildWrapperView(): ComponentRef<LoadAsyncWrapperComponent> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(LoadAsyncWrapperComponent);

    return this.viewContainer.createComponent(componentFactory, undefined, this.wrapperInjector);
  }
}
