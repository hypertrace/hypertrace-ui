import { MemoizeModule } from '@hypertrace/common';
import { LoadAsyncModule, OverlayService } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { ExploreFilterLinkComponent } from '../../../components/explore-filter-link/explore-filter-link.component';
import { WaterfallWidgetRendererComponent } from './waterfall-widget-renderer.component';
import { WaterfallChartComponent } from './waterfall/waterfall-chart.component';

describe('Waterfall widget renderer component', () => {
  const mockModel = {
    getData: jest.fn(() => of([{}]))
  };

  const createComponent = createComponentFactory<WaterfallWidgetRendererComponent>({
    component: WaterfallWidgetRendererComponent,
    shallow: true,
    imports: [LoadAsyncModule, MemoizeModule],
    providers: [
      ...mockDashboardWidgetProviders(mockModel),
      mockProvider(OverlayService),
      mockProvider(ExplorerService)
    ],
    declarations: [MockComponent(WaterfallChartComponent), MockComponent(ExploreFilterLinkComponent)]
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
