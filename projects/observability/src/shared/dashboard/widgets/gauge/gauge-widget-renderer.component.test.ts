import { Color, FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentComponent } from '@hypertrace/components';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { GaugeComponent } from './../../../components/gauge/gauge.component';
import { GaugeWidgetRendererComponent } from './gauge-widget-renderer.component';
import { GaugeWidgetModel } from './gauge-widget.model';

describe('Gauge widget renderer component', () => {
  let mockModel: Partial<GaugeWidgetModel> = {};
  const componentFactory = createComponentFactory({
    component: GaugeWidgetRendererComponent,
    shallow: true,
    imports: [FormattingModule, LoadAsyncModule],
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          getTimeRange: jest.fn(),
          model: mockModel,
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ],
    declarations: [MockComponent(GaugeComponent), MockComponent(TitledContentComponent)]
  });

  test('should render provided data with title', () => {
    mockModel = {
      title: 'Test title',
      getData: jest.fn(() =>
        of({
          value: 5,
          maxValue: 10,
          thresholds: [
            {
              start: 0,
              end: 6,
              label: 'Medium',
              color: Color.Brown1
            }
          ]
        })
      )
    };

    const spectator = componentFactory();
    expect(spectator.query(TitledContentComponent)!.title).toBe('TEST TITLE');

    const gaugeComponent = spectator.query(GaugeComponent);
    expect(gaugeComponent).toExist();
    expect(gaugeComponent!.value).toEqual(5);
    expect(gaugeComponent!.maxValue).toEqual(10);
    expect(gaugeComponent!.thresholds).toEqual([
      {
        start: 0,
        end: 6,
        label: 'Medium',
        color: Color.Brown1
      }
    ]);
  });
});
