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
import { isEmpty, isNil } from 'lodash-es';
import { Dictionary } from '../types/types';

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
   * Dynamically create a component and insert it into the view container. Props passed
   * to the component will be set on the component instance.
   *
   * @returns ComponentRef or undefined if the component could not be created
   */
  public attachComponentToViewContainer<T>(opts: DynamicComponentOptions<T>): ComponentRef<T> | undefined {
    if (!isNil(opts.vcr) && !isNil(opts.component)) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(opts.component);

      const componentRef = opts.vcr.createComponent(componentFactory);
      if (!isEmpty(opts.props) && !isNil(componentRef)) {
        Object.assign(componentRef.instance, opts.props);
      }

      return componentRef;
    }

    return undefined;
  }
}

export interface DynamicComponentOptions<T> {
  component: Type<T>;
  vcr?: ViewContainerRef;
  props?: Dictionary<unknown>;
}
