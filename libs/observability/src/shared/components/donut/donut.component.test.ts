import { DEFAULT_COLOR_PALETTE } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { LegendComponent, LegendPosition } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { DonutComponent } from './donut.component';

describe('Donut component', () => {
  const hostFactory = createHostFactory({
    component: DonutComponent,
    entryComponents: [LegendComponent],
    shallow: true,
    providers: [
      mockProvider(ChartTooltipBuilderService),
      {
        provide: DEFAULT_COLOR_PALETTE,
        useValue: {
          name: 'default',
          colors: ['black', 'white']
        }
      }
    ]
  });

  test('should render each segment', () => {
    const spectator = hostFactory(
      `
    <ht-donut [series]="series">
    </ht-donut>`,
      {
        hostProps: {
          series: [
            {
              name: 'first',
              value: 5
            },
            {
              name: 'second',
              value: 3
            }
          ]
        }
      }
    );
    const segments = spectator.queryAll('.donut-arc', { root: true });
    expect(segments.length).toBe(2);
    expect(segments[0]).toHaveAttribute('fill', 'rgb(0, 0, 0)');
    expect(segments[1]).toHaveAttribute('fill', 'rgb(255, 255, 255)');
  });

  test('should render legend with counts by default', () => {
    const spectator = hostFactory(
      `
    <ht-donut [series]="series" legendPosition="${LegendPosition.Right}">
    </ht-donut>`,
      {
        hostProps: {
          series: [
            {
              name: 'first entry',
              value: 5
            },
            {
              name: 'second entry',
              value: 3
            }
          ]
        }
      }
    );
    const legend = spectator.query('ht-legend');
    expect(legend).toExist();

    const legends = spectator.queryAll('.legend-entry', { root: true });
    expect(legends.length).toEqual(2);
    const firstLegend = legends[0];
    expect(firstLegend).toHaveText('first entry');
    expect(firstLegend).toHaveText('5');
    const secondLegend = legends[1];
    expect(secondLegend).toHaveText('second entry');
    expect(secondLegend).toHaveText('3');
  });

  test('should render legend without counts', () => {
    const spectator = hostFactory(
      `
    <ht-donut [series]="series" legendPosition="${LegendPosition.Right}" [displayLegendCounts]="false">
    </ht-donut>`,
      {
        hostProps: {
          series: [
            {
              name: 'first entry',
              value: 5
            },
            {
              name: 'second entry',
              value: 3
            }
          ]
        }
      }
    );
    const legend = spectator.query('ht-legend');
    expect(legend).toExist();

    const legends = spectator.queryAll('.legend-entry', { root: true });
    expect(legends.length).toEqual(2);
    const firstLegend = legends[0];
    expect(firstLegend).toHaveText('first entry');
    expect(firstLegend).not.toHaveText('5');
    const secondLegend = legends[1];
    expect(secondLegend).toHaveText('second entry');
    expect(secondLegend).not.toHaveText('3');
  });

  test('should show tooltip correctly', () => {
    const data = [
      {
        name: 'first entry',
        value: 5,
        color: 'red'
      },
      {
        name: 'second entry',
        value: 3,
        color: 'blue'
      }
    ];

    const mockTooltipRef = {
      showWithData: jest.fn(),
      hide: jest.fn(),
      destroy: jest.fn()
    };

    const spectator = hostFactory(
      `
    <ht-donut [series]="series" legendPosition="${LegendPosition.Right}">
    </ht-donut>`,
      {
        hostProps: {
          series: data
        },
        providers: [
          mockProvider(ChartTooltipBuilderService, {
            constructTooltip: jest.fn().mockReturnValue(mockTooltipRef)
          })
        ]
      }
    );

    // Should show tooltip on hover
    const arcGroupElement = spectator.query(`.donut-arc-group`, { root: true });
    const arcElements = spectator.queryAll(`.donut-arc`, { root: true });
    spectator.dispatchMouseEvent(arcElements[0], 'mousemove');
    expect(mockTooltipRef.showWithData).toHaveBeenCalledWith(
      arcGroupElement,
      expect.objectContaining([
        {
          context: undefined,
          dataPoint: data[0],
          location: { x: 0, y: 0 }
        }
      ])
    );

    expect(mockTooltipRef.hide).not.toHaveBeenCalled();

    spectator.dispatchMouseEvent(arcElements[0], 'mouseleave');
    expect(mockTooltipRef.hide).toHaveBeenCalled();
  });
});
