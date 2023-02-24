import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { mockDashboardWidgetProviders } from '../../test/dashboard-verification';
import { LinkWidgetRendererComponent } from './link-widget-renderer.component';
import { LinkWidgetModel } from './link-widget.model';

describe('Link widget renderer component', () => {
  let spectator: Spectator<LinkWidgetRendererComponent>;
  let mockModel: Partial<LinkWidgetModel> = {};
  const createComponent = createComponentFactory<LinkWidgetRendererComponent>({
    component: LinkWidgetRendererComponent,
    shallow: true
  });

  beforeEach(() => {
    mockModel = {};
  });

  test('Link should be displayed as expected if url and displayText are defined', () => {
    mockModel.url = '#';
    mockModel.displayText = 'Test';
    spectator = createComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.query('ht-link')).toExist();
    expect(spectator.component.getDisplayText()).toEqual('Test');
  });

  test('Link should use url as displayText if displayText is undefined', () => {
    mockModel.url = '#';
    spectator = createComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.query('ht-link')).toExist();
    expect(spectator.component.getDisplayText()).toEqual(mockModel.url);
  });
});
