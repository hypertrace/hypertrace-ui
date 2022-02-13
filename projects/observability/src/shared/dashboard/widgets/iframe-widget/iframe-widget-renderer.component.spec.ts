import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { mockDashboardWidgetProviders } from '../../../../../../dashboards/src/test/dashboard-verification';

import { IframeWidgetRendererComponent } from './iframe-widget-renderer.component';

describe('IFrame Widget Renderer Component', () => {
  let spectator: Spectator<IframeWidgetRendererComponent>;

  const createComponent = createComponentFactory<IframeWidgetRendererComponent>({
    component: IframeWidgetRendererComponent,
    providers: [...mockDashboardWidgetProviders({})],
    shallow: true
  });

  test('should use iframe component', () => {
    spectator = createComponent();
    expect(spectator.query('ht-iframe')).toExist();
  });
});
