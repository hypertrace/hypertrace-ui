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
import { LoaderType } from '@hypertrace/assets-library';
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
  @Input()
  public htLoadAsyncLoaderType!: LoaderType;

  private readonly wrapperParamsSubject: ReplaySubject<LoadAsyncWrapperParameters> = new ReplaySubject(1);
  private wrapperInjector!: Injector;
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
    if (this.data$) {
      this.wrapperView = this.wrapperView || this.buildWrapperView();
      this.wrapperParamsSubject.next({
        state$: this.loadAsyncService.mapObservableState(this.data$),
        loaderType: this.htLoadAsyncLoaderType,
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
