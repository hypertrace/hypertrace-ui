import { FormattingModule } from '@hypertrace/common';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { TopNChartComponent, TopNData } from './top-n-chart.component';

describe('Top N Chart Component', () => {
  let spectator: Spectator<TopNChartComponent>;

  const createHost = createHostFactory({
    component: TopNChartComponent,
    shallow: true,
    imports: [FormattingModule]
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

    expect(spectator.component.itemOptions).toEqual([
      expect.objectContaining({
        label: 'POST /api 2'
      }),
      expect.objectContaining({
        label: 'POST /api 1'
      }),
      expect.objectContaining({
        label: 'POST /api 3'
      })
    ]);
  });

  test('should have clickable labels', () => {
    const data = [
      {
        label: 'POST /api 1',
        value: 120
      }
    ];

    const onItemClick: jest.Mock = jest.fn();

    spectator = createHost(
      `<ht-top-n-chart [data]="data" [labelClickable]="labelClickable" (itemClick)="onItemClick($event)">
      </ht-top-n-chart>`,
      {
        hostProps: {
          data: data,
          labelClickable: true,
          onItemClick: onItemClick
        }
      }
    );

    spectator.click(spectator.query('.label')!);
    expect(onItemClick).toHaveBeenCalledWith(data[0]);
  });

  test('should show progress bar and value', () => {
    const data = [
      {
        label: 'POST /api 1',
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

    expect(spectator.query('.progress-value')).toExist();
    expect(spectator.query('.value')).toHaveText('120');
  });
});
