import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  StaticProvider,
  Type,
  ViewContainerRef
} from '@angular/core';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class DynamicComponentService {
  public constructor(private readonly componentFactoryResolver: ComponentFactoryResolver) {}

  public insertComponent<C>(
    container: Element,
    componentClass: Type<C>,
    injector: Injector,
    providers: StaticProvider[] = []
  ): ComponentRef<C> {
    const componentResolver = injector.get((ComponentFactoryResolver as unknown) as Type<ComponentFactoryResolver>);

    const applicationRef = injector.get(ApplicationRef);
    const domPortalOutlet = new DomPortalOutlet(container, componentResolver, applicationRef, injector);
    const componentInjector = Injector.create({
      parent: injector,
      providers: providers
    });
    const componentPortal = new ComponentPortal(componentClass, undefined, componentInjector);

    return domPortalOutlet.attach(componentPortal);
  }

  /**
   * Dynamically create a component and insert it into the view container. Data and services can be provided to the dynamic
   * component via `providers`
   *
   * @returns ComponentRef or undefined if the component could not be created
   */
  public attachComponentToViewContainer<T>(opts: DynamicComponentOptions<T>): ComponentRef<T> | undefined {
    if (!isNil(opts.viewContainerRef) && !isNil(opts.componentClass)) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(opts.componentClass);
      const componentInjector = Injector.create({
        parent: opts.injector,
        providers: opts.providers ?? []
      });

      return opts.viewContainerRef.createComponent(componentFactory, opts.index, componentInjector);
    }

    return undefined;
  }
}

export interface DynamicComponentOptions<T> {
  componentClass: Type<T>;
  injector: Injector;
  providers: StaticProvider[];
  viewContainerRef?: ViewContainerRef;
  index?: number;
}
