import { Component, Inject, InjectionToken, Injector } from '@angular/core';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { DynamicComponentService } from './dynamic-component.service';

describe('Dynamic component service', () => {
  const injectionToken = new InjectionToken<string>('test token');
  @Component({
    // tslint:disable-next-line: component-selector
    selector: 'dynamic-component',
    template: 'Dynamic component {{this.injected}}'
  })
  class DynamicComponent {
    public constructor(@Inject(injectionToken) public readonly injected: string) {}
  }

  const componentFactory = createComponentFactory({
    component: Component({
      selector: 'host-component',
      template: '<div class="host-container"></div>'
    })(class {}),
    declarations: [DynamicComponent],
    entryComponents: [DynamicComponent]
  });

  test('can create a component', () => {
    const spectator = componentFactory();

    const container = spectator.query('.host-container');
    const dynamicComponentService = spectator.inject(DynamicComponentService);
    const injector = spectator.inject(Injector);

    const componentRef = dynamicComponentService.insertComponent(container, DynamicComponent, injector, [
      { provide: injectionToken, useValue: 'injected value' }
    ]);

    expect(componentRef.instance).toBeInstanceOf(DynamicComponent);
    spectator.detectChanges(); // Need a cycle to update the binding
    expect(spectator.element).toHaveText('injected value');
  });
});
