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

@Injectable({ providedIn: 'root' })
export class DynamicComponentService {
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
   * **Note**: The provided view container ref should be a proper DOM Node (`div`, `section`, etc) and not something like
   * `ng-container`
   * @returns ComponentRef or undefined if the component could not be created
   */
  public insertComponentToViewContainer<C>(
    componentClass: Type<C>,
    viewContainerRef: ViewContainerRef,
    providers: StaticProvider[] = []
  ): ComponentRef<C> | undefined {
    return this.insertComponent(
      viewContainerRef.element.nativeElement,
      componentClass,
      viewContainerRef.injector,
      providers
    );
  }
}
