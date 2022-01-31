import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  StaticProvider,
  Type
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicComponentService {
  public insertComponent<C>(
    container: Element,
    componentClass: Type<C>,
    injector: Injector,
    providers: StaticProvider[] = []
  ): ComponentRef<C> {
    const componentResolver = injector.get(ComponentFactoryResolver as unknown as Type<ComponentFactoryResolver>);

    const applicationRef = injector.get(ApplicationRef);
    const domPortalOutlet = new DomPortalOutlet(container, componentResolver, applicationRef, injector);
    const componentInjector = Injector.create({
      parent: injector,
      providers: providers
    });
    const componentPortal = new ComponentPortal(componentClass, undefined, componentInjector);

    return domPortalOutlet.attach(componentPortal);
  }
}
