import {
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
import { LoadAsyncConfig, LoadAsyncContext, LoadAsyncService } from './load-async.service';
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

  @Input('htLoadAsyncConfig')
  public config?: LoadAsyncConfig;
  private readonly wrapperParamsSubject: ReplaySubject<LoadAsyncWrapperParameters> = new ReplaySubject(1);
  private readonly wrapperInjector: Injector;
  private wrapperView?: ComponentRef<LoadAsyncWrapperComponent>;

  public constructor(
    private readonly viewContainer: ViewContainerRef,
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

  private buildWrapperView(): ComponentRef<LoadAsyncWrapperComponent> {
    return this.viewContainer.createComponent<LoadAsyncWrapperComponent>(LoadAsyncWrapperComponent, {
      injector: this.wrapperInjector
    });
  }
}
