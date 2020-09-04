import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { LinkWidgetRendererComponent } from './link-widget-renderer.component';
import { LinkWidgetModel } from './link-widget.model';
import { LinkWidgetModule } from './link-widget.module';

describe('Link widget renderer component', () => {
  let spectator: Spectator<LinkWidgetRendererComponent>;
  let mockModel: Partial<LinkWidgetModel> = {};
  const createComponent = createComponentFactory<LinkWidgetRendererComponent>({
    component: LinkWidgetRendererComponent,
    imports: [LinkWidgetModule, RouterTestingModule],
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          model: mockModel,
          getTimeRange: jest.fn(),
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      },
      mockProvider(NavigationService, {
        navigateWithinApp: jest.fn().mockReturnValue(EMPTY)
      })
    ],
    declareComponent: false
  });

  beforeEach(() => {
    mockModel = {};
  });

  test('Link should be displayed as expected if url and displayText are defined', fakeAsync(() => {
    mockModel.url = '#';
    mockModel.displayText = 'Test';
    spectator = createComponent();

    expect(spectator.query('.htc-link')).toExist();
    expect(spectator.query('.htc-link')).toHaveText(mockModel.displayText);
    spectator.triggerEventHandler('.htc-link', 'click', {});
    expect(spectator.inject(NavigationService).navigateWithinApp).toHaveBeenCalledWith(mockModel.url);
  }));

  test('Link should use url as displayText if displayText is undefined', fakeAsync(() => {
    mockModel.url = '#';
    spectator = createComponent();

    expect(spectator.query('htc-link')).toExist();
    expect(spectator.query('.htc-link')).toHaveText(mockModel.url);
    spectator.triggerEventHandler('.htc-link', 'click', {});
    expect(spectator.inject(NavigationService).navigateWithinApp).toHaveBeenCalledWith(mockModel.url);
  }));
});
