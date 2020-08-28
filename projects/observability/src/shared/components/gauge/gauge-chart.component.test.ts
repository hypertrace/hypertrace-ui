import { FormattingModule } from '@hypertrace/common';
import { GaugeChartComponent, GaugeData } from '@hypertrace/observability';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';

describe('Gauge Chart Component', () => {
  let spectator: Spectator<GaugeChartComponent>;

  const createHost = createHostFactory({
    component: GaugeChartComponent,
    shallow: true,
    imports: [FormattingModule]
  });

  test('should convert data in valid options', () => {
    const data: GaugeData[] = [
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
      `<ht-gauge-chart [data]="data">
      </ht-gauge-chart>`,
      {
        hostProps: {
          data: data
        }
      }
    );

    expect(spectator.component.itemOptions).toEqual([
      expect.objectContaining({
        label: 'POST /api 1'
      }),
      expect.objectContaining({
        label: 'POST /api 3'
      }),
      expect.objectContaining({
        label: 'POST /api 2'
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
      `<ht-gauge-chart [data]="data" [labelClickable]="labelClickable" (itemClick)="onItemClick($event)">
      </ht-gauge-chart>`,
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
      `<ht-gauge-chart [data]="data">
      </ht-gauge-chart>`,
      {
        hostProps: {
          data: data
        }
      }
    );

    expect(spectator.query('.progress-value')).toExist();
    expect(spectator.query('.value')).toHaveText('120');
  });

  test('should determine color using label', () => {
    const data: GaugeData[] = [
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
      `<ht-gauge-chart [data]="data" [determineColor]="determineColor">
      </ht-gauge-chart>`,
      {
        hostProps: {
          data: data,
          determineColor: (colorKey: string): string => {
            switch (colorKey) {
              case 'POST /api 1':
                return 'red';
              default:
                return 'blue';
            }
          }
        }
      }
    );

    expect(spectator.component.itemOptions).toEqual([
      expect.objectContaining({
        label: 'POST /api 1',
        color: 'red'
      }),
      expect.objectContaining({
        label: 'POST /api 3',
        color: 'blue'
      }),
      expect.objectContaining({
        label: 'POST /api 2',
        color: 'blue'
      })
    ]);
  });

  test('should determine color using colorKey', () => {
    const data: GaugeData[] = [
      {
        label: 'POST /api 1',
        value: 80,
        colorKey: 'true'
      },
      {
        label: 'POST /api 3',
        value: 40,
        colorKey: 'false'
      },
      {
        label: 'POST /api 2',
        value: 120
      }
    ];

    spectator = createHost(
      `<ht-gauge-chart [data]="data" [determineColor]="determineColor">
      </ht-gauge-chart>`,
      {
        hostProps: {
          data: data,
          determineColor: (colorKey: string): string => {
            switch (colorKey) {
              case 'true':
                return 'red';
              case 'false':
                return 'black';
              default:
                return 'blue';
            }
          }
        }
      }
    );

    expect(spectator.component.itemOptions).toEqual([
      expect.objectContaining({
        label: 'POST /api 1',
        color: 'red'
      }),
      expect.objectContaining({
        label: 'POST /api 3',
        color: 'black'
      }),
      expect.objectContaining({
        label: 'POST /api 2',
        color: 'blue'
      })
    ]);
  });
});
