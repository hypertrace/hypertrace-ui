import { GaugeChartComponent } from '@hypertrace/observability';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { TopNChartComponent, TopNData } from './top-n-chart.component';

describe('Top N Chart Component', () => {
  let spectator: Spectator<TopNChartComponent>;

  const createHost = createHostFactory({
    component: TopNChartComponent,
    shallow: true,
    declarations: [MockComponent(GaugeChartComponent)]
  });

  test('should convert data in descending order of their value', () => {
    const data: TopNData[] = [
      {
        label: 'POST /api 1',
        value: 80
      },
      {
        label: 'POST /api 3',
        value: 40
      },
      {
        label: 'POST /api 2',
        value: 120
      }
    ];

    spectator = createHost(
      `<ht-top-n-chart [data]="data">
      </ht-top-n-chart>`,
      {
        hostProps: {
          data: data
        }
      }
    );

    const gaugeChartComponent = spectator.query(GaugeChartComponent);
    expect(gaugeChartComponent?.data).toEqual([
      {
        label: 'POST /api 2',
        value: 120
      },
      {
        label: 'POST /api 1',
        value: 80
      },
      {
        label: 'POST /api 3',
        value: 40
      }
    ]);
  });
});
