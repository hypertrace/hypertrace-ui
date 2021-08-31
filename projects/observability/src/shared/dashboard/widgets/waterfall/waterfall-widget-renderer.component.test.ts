import { LoadAsyncModule, OverlayService } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { WaterfallWidgetRendererComponent } from './waterfall-widget-renderer.component';
import { WaterfallChartComponent } from './waterfall/waterfall-chart.component';

describe('Waterfall widget renderer component', () => {
  const mockModel = {
    getData: jest.fn(() => of([{}]))
  };

  const createComponent = createComponentFactory<WaterfallWidgetRendererComponent>({
    component: WaterfallWidgetRendererComponent,
    shallow: true,
    imports: [LoadAsyncModule],
    providers: [...mockDashboardWidgetProviders(mockModel), mockProvider(OverlayService)],
    declarations: [MockComponent(WaterfallChartComponent)]
  });

  test('renders the widget', () => {
    const spectator = createComponent();
    expect(spectator.query(WaterfallChartComponent)).toExist();
  });

  test('gets callback when collapsing all', () => {
    const spectator = createComponent();
    const spy = jest.spyOn(spectator.component, 'onCollapseAll');
    spectator.click('[label="Collapse All"]');
    expect(spy).toHaveBeenCalled();
  });

  test('gets callback when expanding all', () => {
    const spectator = createComponent();
    const spy = jest.spyOn(spectator.component, 'onExpandAll');
    spectator.click('[label="Expand All"]');
    expect(spy).toHaveBeenCalled();
  });
});
