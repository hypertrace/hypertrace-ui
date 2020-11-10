import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentComponent } from '@hypertrace/components';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { DonutComponent } from '../../../components/donut/donut.component';
import { LegendPosition } from '../../../components/legend/legend.component';
import { DonutWidgetRendererComponent } from './gauge-widget-renderer.component';
import { DonutWidgetModel } from './gauge-widget.model';

describe('Donut widget renderer component', () => {
  let mockModel: Partial<DonutWidgetModel> = {};
  const componentFactory = createComponentFactory({
    component: DonutWidgetRendererComponent,
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
    declarations: [MockComponent(DonutComponent), MockComponent(TitledContentComponent)]
  });
  test('should render provided data with title and legend', () => {
    mockModel = {
      header: {
        title: 'Test title'
      },
      legendPosition: LegendPosition.Right,
      getData: jest.fn(() =>
        of({
          series: [
            {
              name: 'first',
              value: 3
            },
            {
              name: 'second',
              value: 5
            }
          ],
          center: {
            title: 'total',
            value: 2
          }
        })
      ),
      displayLegendCounts: false
    };

    const spectator = componentFactory();
    expect(spectator.query(TitledContentComponent)!.title).toBe('TEST TITLE');

    expect(spectator.query(DonutComponent)!.series).toEqual([
      {
        name: 'first',
        value: 3
      },
      {
        name: 'second',
        value: 5
      }
    ]);
    expect(spectator.query(DonutComponent)!.center).toEqual({
      title: 'total',
      value: 2
    });
    expect(spectator.query(DonutComponent)!.legendPosition).toEqual(LegendPosition.Right);
    expect(spectator.query(DonutComponent)!.displayLegendCounts).toEqual(false);
  });
});
