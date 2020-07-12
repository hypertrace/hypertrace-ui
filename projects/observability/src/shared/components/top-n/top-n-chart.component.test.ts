import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { TopNChartComponent, TopNData } from './top-n-chart.component';

describe('TopN Chart Component', () => {
  let spectator: Spectator<TopNChartComponent>;

  const createHost = createHostFactory({
    component: TopNChartComponent,
    shallow: true
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

    expect(spectator.component.histogramData).toEqual([
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

  test('should have clickable labels', () => {
    const data = [
      {
        label: 'POST /api 1',
        value: 120
      }
    ];

    const onLabelClick: jest.Mock = jest.fn();

    spectator = createHost(
      `<ht-top-n-chart [data]="data" [labelClickable]="labelClickable" (labelClick)="onLabelClick($event)">
      </ht-top-n-chart>`,
      {
        hostProps: {
          data: data,
          labelClickable: true,
          onLabelClick: onLabelClick
        }
      }
    );

    spectator.triggerEventHandler('ht-histogram-chart', 'labelClick', 'POST /api 1');
    expect(onLabelClick).toHaveBeenCalledWith('POST /api 1');
  });
});
