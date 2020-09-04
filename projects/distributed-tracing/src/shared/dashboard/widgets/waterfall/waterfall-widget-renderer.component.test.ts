import { LoadAsyncModule, OverlayService } from '@hypertrace/components';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { WaterfallWidgetRendererComponent } from './waterfall-widget-renderer.component';
import { WaterfallChartComponent } from './waterfall/waterfall-chart.component';

describe('Waterfall widget renderer component', () => {
  const createComponent = createComponentFactory<WaterfallWidgetRendererComponent>({
    component: WaterfallWidgetRendererComponent,
    shallow: true,
    imports: [LoadAsyncModule],
    providers: [
      {
        provide: RENDERER_API,
        useValue: {
          getTimeRange: jest.fn(),
          model: {
            getData: jest.fn(() => of([{}]))
          },
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        }
      },
      mockProvider(OverlayService)
    ],
    declarations: [MockComponent(WaterfallChartComponent)]
  });

  test('renders the widget', () => {
    const spectator = createComponent();
    expect(spectator.query(WaterfallChartComponent)).toExist();
  });

  test('gets callback when collapsing all', () => {
    const spectator = createComponent();
    const spy = spyOn(spectator.component, 'onCollapseAll');
    spectator.click('[label="Collapse All"]');
    expect(spy).toHaveBeenCalled();
  });

  test('gets callback when expanding all', () => {
    const spectator = createComponent();
    const spy = spyOn(spectator.component, 'onExpandAll');
    spectator.click('[label="Expand All"]');
    expect(spy).toHaveBeenCalled();
  });
});
