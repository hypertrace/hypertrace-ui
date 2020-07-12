import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { BLUE_COLOR_PALETTE, RED_COLOR_PALETTE } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { LegendComponent } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { ChartTooltipModule } from '../utils/chart-tooltip/chart-tooltip.module';
import { BubbleChart, BubbleChartData } from './bubble-chart';
import { BubbleChartBuilderService } from './bubble-chart-builder.service';
import { BubbleChartComponent } from './bubble-chart.component';

@Component({
  selector: 'ht-custom-tooltip',
  template: `<div class="custom-tooltip">TooltipText</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomChartTooltipComponent {}

describe('Bubble chart component', () => {
  const hostFactory = createHostFactory({
    component: BubbleChartComponent,
    shallow: true,
    declarations: [LegendComponent, CustomChartTooltipComponent],
    imports: [ChartTooltipModule],
    providers: [
      {
        provide: BLUE_COLOR_PALETTE,
        useValue: ['black', 'white']
      },
      {
        provide: RED_COLOR_PALETTE,
        useValue: ['black', 'white']
      },
      mockProvider(ChartTooltipBuilderService)
    ]
  });

  const bubbleData: BubbleChartData[] = [
    {
      x: 1,
      y: 1,
      r: 2,
      colorKey: 'first'
    },
    {
      x: 2,
      y: 2,
      r: 1,
      colorKey: 'second'
    }
  ];

  test('should init and destroy ', () => {
    const mockChart: BubbleChart<BubbleChartData> = {
      destroy: jest.fn(),
      reflow: jest.fn(),
      selections$: new Subject<Set<BubbleChartData>>().asObservable(),
      updateSelections: jest.fn()
    };

    const spectator = hostFactory(
      `
    <ht-bubble-chart [data]="data">
    </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData
        },
        providers: [
          mockProvider(BubbleChartBuilderService, {
            build: jest.fn().mockReturnValue(mockChart)
          })
        ]
      }
    );

    expect(spectator.inject(BubbleChartBuilderService).build).toHaveBeenCalledWith(
      expect.objectContaining({ nativeElement: spectator.query('ht-bubble-chart > div') }),
      spectator.inject(Injector, true),
      {
        data: bubbleData,
        selections: []
      }
    );

    spectator.fixture.destroy();
    expect(mockChart.destroy).toHaveBeenCalled();
  });

  test('should render bubbles without constraints', () => {
    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          selections: []
        }
      }
    );

    const bubbles = spectator.queryAll('.data-bubble', { root: true });
    expect(bubbles.length).toBe(2);
    expect(bubbles[0]).toHaveAttribute('fill', 'rgb(0, 0, 0)');
    expect(bubbles[1]).toHaveAttribute('fill', 'rgb(255, 255, 255)');

    const legend = spectator.queryAll('ht-legend', { root: true });
    expect(legend).toExist();
    expect(legend).toHaveText('first');
    expect(legend).toHaveText('second');
  });

  test('should render bubbles with constraints', () => {
    const xMin = -1;
    const xMax = 3;
    const yMin = -1;
    const yMax = 3;

    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data" [xMin]="xMin" [xMax]="xMax" [yMin]="yMin" [yMax]="yMax">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          xMin: xMin,
          xMax: xMax,
          yMin: yMin,
          yMax: yMax,
          selections: []
        }
      }
    );

    const bubbles = spectator.queryAll('.data-bubble', { root: true });
    expect(bubbles.length).toBe(2);
    expect(bubbles[0]).toHaveAttribute('fill', 'rgb(0, 0, 0)');
    expect(bubbles[1]).toHaveAttribute('fill', 'rgb(255, 255, 255)');

    const legend = spectator.queryAll('ht-legend', { root: true });
    expect(legend).toExist();
    expect(legend).toHaveText('first');
    expect(legend).toHaveText('second');
  });

  test('bubble click should toggle selection', () => {
    const onSelectionChangedSpy = jest.fn();
    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data" (selectionsChange)="onSelectionChanged($event)">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          onSelectionChanged: onSelectionChangedSpy
        }
      }
    );

    const bubbles = spectator.queryAll('.bubble-group', { root: true });
    expect(bubbles.length).toBe(2);
    // Click bubble0 once
    spectator.dispatchFakeEvent(bubbles[0], 'click', true);
    expect(onSelectionChangedSpy).toHaveBeenCalledWith([bubbleData[0]]);

    // Click bubble0 again to toggle selections
    spectator.dispatchFakeEvent(bubbles[0], 'click', true);
    expect(onSelectionChangedSpy).toHaveBeenCalledWith([]);

    // Click bubble0 and bubble1
    spectator.dispatchFakeEvent(bubbles[0], 'click', true);
    spectator.dispatchFakeEvent(bubbles[1], 'click', true);
    expect(onSelectionChangedSpy).toHaveBeenCalledWith([bubbleData[0], bubbleData[1]]);
  });

  test('should select bubbles based on selections', () => {
    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data" [selections]="selections">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          selections: [bubbleData[0]]
        }
      }
    );

    const bubbles = spectator.queryAll('.bubble-group', { root: true });
    expect(bubbles.length).toBe(2);
    expect(bubbles[0].classList.contains('active')).toBeTruthy();
  });

  test('should limit bubbles selections based on max allowed selections count', () => {
    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data" [selections]="selections" [maxAllowedSelectionsCount]="1">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          selections: [bubbleData[0]]
        }
      }
    );

    const bubbles = spectator.queryAll('.bubble-group', { root: true });
    expect(bubbles.length).toBe(2);

    expect(bubbles[0].classList.contains('active')).toBeTruthy();
    expect(bubbles[1].classList.contains('active')).toBeFalsy();
    // Clicking on bubble 1 should not select it
    spectator.dispatchFakeEvent(bubbles[1], 'click', true);
    expect(bubbles[0].classList.contains('active')).toBeTruthy();
    expect(bubbles[1].classList.contains('active')).toBeFalsy();
  });

  test('should show tooltip correctly', () => {
    const mockTooltipRef = {
      showWithData: jest.fn(),
      hide: jest.fn(),
      destroy: jest.fn()
    };

    const mockConstructTooltip = jest.fn().mockReturnValue(mockTooltipRef);

    const spectator = hostFactory(
      `
      <ht-bubble-chart [data]="data" [tooltipOption]="tooltipOption">
      </ht-bubble-chart>`,
      {
        hostProps: {
          data: bubbleData,
          tooltipOption: {
            title: 'test',
            component: CustomChartTooltipComponent
          }
        },
        providers: [
          mockProvider(ChartTooltipBuilderService, {
            constructTooltip: mockConstructTooltip
          })
        ]
      }
    );

    // Should show tooltip on hover
    const visualizationElement = spectator.query('.chart-visualization-container');
    spectator.dispatchMouseEvent(visualizationElement!, 'mousemove', -1, -1);
    const tooltipData = [
      {
        dataPoint: {
          x: 1,
          y: 1,
          r: 2,
          color: 'rgb(0, 0, 0)',
          original: bubbleData[0]
        }
      }
    ];

    expect(mockTooltipRef.showWithData).toHaveBeenCalledWith(
      visualizationElement,
      expect.objectContaining([
        {
          context: undefined,
          dataPoint: tooltipData[0].dataPoint,
          location: { x: -1, y: -1 }
        }
      ])
    );

    expect(mockTooltipRef.hide).not.toHaveBeenCalled();

    spectator.dispatchMouseEvent(visualizationElement!, 'mouseleave');
    expect(mockTooltipRef.hide).toHaveBeenCalled();

    // Getting the first argument from mocked constructTooltip
    const tooltipDataMapperFunction = mockConstructTooltip.mock.calls[0][0];
    expect(tooltipDataMapperFunction).not.toBeNull();
    expect(tooltipDataMapperFunction(tooltipData)).toEqual([bubbleData[0]]);
  });
});
