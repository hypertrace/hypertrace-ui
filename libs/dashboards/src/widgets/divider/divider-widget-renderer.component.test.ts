import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { mockDashboardWidgetProviders } from '../../test/dashboard-verification';
import { DividerWidgetRendererComponent } from './divider-widget-renderer.component';

describe('Divider Widget Renderer Component', () => {
  let spectator: Spectator<DividerWidgetRendererComponent>;

  const createComponent = createComponentFactory<DividerWidgetRendererComponent>({
    component: DividerWidgetRendererComponent,
    providers: [...mockDashboardWidgetProviders({})],
    shallow: true
  });

  test('should use divider component', () => {
    spectator = createComponent();
    expect(spectator.query('ht-divider')).toExist();
  });
});
