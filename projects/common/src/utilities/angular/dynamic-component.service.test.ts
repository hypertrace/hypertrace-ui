// tslint:disable:max-classes-per-file
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
  Injector,
  Optional,
  ViewContainerRef
} from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { createComponentFactory, createServiceFactory } from '@ngneat/spectator/jest';
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

  describe('Test attachComponentToViewContainer method', () => {
    const MOCK_TOKEN = new InjectionToken<string>('test token');

    @Component({
      selector: 'ht-mock-component',
      template: `
        <div class="title">
          {{ this.title }}
        </div>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class MockComponent {
      public constructor(
        public readonly vcr: ViewContainerRef,
        @Optional() @Inject(MOCK_TOKEN) public readonly title: string
      ) {}
    }

    const createService = createServiceFactory({
      service: DynamicComponentService
    });

    const createComponent = createComponentFactory({
      component: MockComponent
    });

    test('should render the component correctly with the props passed', fakeAsync(() => {
      const spectator = createService();
      const mockComponent = createComponent();
      const injector = spectator.inject(Injector);
      const component = spectator.service.attachComponentToViewContainer<MockComponent>({
        componentClass: MockComponent,
        viewContainerRef: mockComponent.component.vcr,
        injector: injector,
        providers: [
          {
            provide: MOCK_TOKEN,
            useValue: 'test'
          }
        ]
      });

      mockComponent.tick();
      expect(component).toBeDefined();
      const compElRef = component?.location.nativeElement as HTMLDivElement;
      expect(compElRef.textContent?.trim()).toEqual('test');
    }));
  });
});
