import { BLUE_COLOR_PALETTE, FormattingModule, RED_COLOR_PALETTE } from '@hypertrace/common';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { HistogramBarData, HistogramChartComponent } from './histogram-chart.component';

describe('Histogram Chart Component', () => {
  let spectator: Spectator<HistogramChartComponent>;

  const createHost = createHostFactory({
    component: HistogramChartComponent,
    imports: [FormattingModule],
    providers: [
      {
        provide: BLUE_COLOR_PALETTE,
        useValue: ['black', 'white']
      },
      {
        provide: RED_COLOR_PALETTE,
        useValue: ['black', 'white']
      }
    ],
    shallow: true
  });

  test('should show a label and a histogram bar', () => {
    const data: HistogramBarData[] = [
      {
        label: 'POST /api 1',
        value: 120
      },
      {
        label: 'POST /api 2',
        value: 80
      },
      {
        label: 'POST /api 3',
        value: 40
      }
    ];

    spectator = createHost(
      `<ht-histogram-chart [data]="data">
      </ht-histogram-chart>`,
      {
        hostProps: {
          data: data
        }
      }
    );

    // Must render 3 items
    const histogramBars = spectator.queryAll('.histogram-bar');
    expect(histogramBars.length).toBe(3);

    // Match rendered label values with data
    histogramBars.forEach((histogramBar, index) => {
      const labelElement = histogramBar.querySelector('.bar-label') as HTMLElement;
      const barValueElement = histogramBar.querySelector('.bar-value > .bar') as HTMLElement;
      const textValueElement = histogramBar.querySelector('.bar-value > .value') as HTMLElement;

      expect(labelElement).toExist();

      expect(labelElement).toHaveText(data[index].label);

      expect(barValueElement).toExist();

      expect(textValueElement).toHaveText(data[index].value.toString());
    });
  });

  test('should assign default colors', () => {
    const data: HistogramBarData[] = [
      {
        label: 'POST /api 1',
        value: 120
      },
      {
        label: 'POST /api 2',
        value: 80
      },
      {
        label: 'POST /api 3',
        value: 40
      }
    ];

    spectator = createHost(
      `<ht-histogram-chart [data]="data">
      </ht-histogram-chart>`,
      {
        hostProps: {
          data: data
        }
      }
    );

    const histogramBars = spectator.queryAll('.histogram-bar');

    // First Value
    const firstValueElement = histogramBars[0].querySelector('.bar-value > .bar') as HTMLElement;
    expect(firstValueElement.style.backgroundColor).toBeDefined();

    // Second Value
    const secondValueElement = histogramBars[1].querySelector('.bar-value > .bar') as HTMLElement;
    expect(secondValueElement.style.backgroundColor).toBeDefined();

    // Third Value
    const thirdValueElement = histogramBars[2].querySelector('.bar-value > .bar') as HTMLElement;
    expect(thirdValueElement.style.backgroundColor).toBeDefined();
  });

  test('should assign user input colors', () => {
    const data: HistogramBarData[] = [
      {
        label: 'POST /api 1',
        value: 120,
        colorKey: 'POST /api 1'
      },
      {
        label: 'POST /api 2',
        value: 80,
        colorKey: 'POST /api 2'
      },
      {
        label: 'POST /api 3',
        value: 40,
        colorKey: 'POST /api 3'
      }
    ];

    const determineColor = (colorKey: string): string => {
      switch (colorKey) {
        case 'POST /api 1':
          return 'rgb(0, 0, 255)';
        case 'POST /api 2':
          return 'rgb(0, 255, 0)';
        case 'POST /api 3':
          return 'rgb(255, 0, 0)';
        default:
          return 'rgb(0, 0, 0)';
      }
    };

    spectator = createHost(
      `<ht-histogram-chart [data]="data" [determineColor]="determineColor">
      </ht-histogram-chart>`,
      {
        hostProps: {
          data: data,
          determineColor: determineColor
        }
      }
    );

    const histogramBars = spectator.queryAll('.histogram-bar');

    // First Value
    const firstValueElement = histogramBars[0].querySelector('.bar-value > .bar') as HTMLElement;
    expect(firstValueElement.style.backgroundColor).toEqual('rgb(0, 0, 255)');

    // Second Value
    const secondValueElement = histogramBars[1].querySelector('.bar-value > .bar') as HTMLElement;
    expect(secondValueElement.style.backgroundColor).toEqual('rgb(0, 255, 0)');

    // Third Value
    const thirdValueElement = histogramBars[2].querySelector('.bar-value > .bar') as HTMLElement;
    expect(thirdValueElement.style.backgroundColor).toEqual('rgb(255, 0, 0)');
  });

  test('should assign colors, based on colorKey', () => {
    const data: HistogramBarData[] = [
      {
        label: 'POST /api 1',
        value: 120,
        colorKey: 'keyA'
      },
      {
        label: 'POST /api 2',
        value: 80,
        colorKey: 'keyB'
      },
      {
        label: 'POST /api 3',
        value: 40,
        colorKey: 'keyB'
      }
    ];

    const determineColor = (colorKey: string): string => (colorKey === 'keyA' ? 'red' : 'black');

    spectator = createHost(
      `<ht-histogram-chart [data]="data" [determineColor]="determineColor">
      </ht-histogram-chart>`,
      {
        hostProps: {
          data: data,
          determineColor: determineColor
        }
      }
    );

    const histogramBars = spectator.queryAll('.histogram-bar');

    // First Value
    const firstValueElement = histogramBars[0].querySelector('.bar-value > .bar') as HTMLElement;
    expect(firstValueElement.style.backgroundColor).toEqual('red');

    // Second Value
    const secondValueElement = histogramBars[1].querySelector('.bar-value > .bar') as HTMLElement;
    expect(secondValueElement.style.backgroundColor).toEqual('black');

    // Third Value
    const thirdValueElement = histogramBars[2].querySelector('.bar-value > .bar') as HTMLElement;
    expect(thirdValueElement.style.backgroundColor).toEqual('black');
  });

  test('should have clickable labels', () => {
    const data: HistogramBarData[] = [
      {
        label: 'POST /api 1',
        value: 120
      }
    ];

    const onLabelClick: jest.Mock = jest.fn();

    spectator = createHost(
      `<ht-histogram-chart [data]="data" [labelClickable]="labelClickable" (labelClick)="onLabelClick($event)">
      </ht-histogram-chart>`,
      {
        hostProps: {
          data: data,
          labelClickable: true,
          onLabelClick: onLabelClick
        }
      }
    );

    const histogramBars = spectator.query('.histogram-bar');

    expect(histogramBars).toExist();

    // First Value
    const barLabelElement = histogramBars!.querySelector('.bar-label');
    expect(barLabelElement).toExist();

    expect(histogramBars!.querySelector('.clickable')).toEqual(barLabelElement);

    spectator.click(barLabelElement!);

    expect(onLabelClick).toHaveBeenCalledWith('POST /api 1');
  });
});
