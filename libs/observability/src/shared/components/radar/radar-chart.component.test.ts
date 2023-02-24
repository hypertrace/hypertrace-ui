import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ColorService, DomElementMeasurerService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { SvgUtilService } from '../utils/svg/svg-util.service';
import { RadarChartComponent } from './radar-chart.component';
import { RadarChartModule } from './radar-chart.module';

describe('Radar Chart component', () => {
  // NOTE: tests need to query from root because angular abstraction does not support SVG
  const createHost = createHostFactory({
    component: RadarChartComponent,
    declareComponent: false,
    imports: [RadarChartModule, RouterTestingModule],
    providers: [
      mockProvider(DomElementMeasurerService, {
        measureSvgElement: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }),
        getComputedTextLength: () => 50
      }),
      mockProvider(SvgUtilService, {
        wrapTextIfNeeded: () => {
          /** Noop */
        }
      }),
      mockProvider(ColorService)
    ]
  });

  test('should render all axes', () => {
    const axes = [
      {
        name: 'Latency'
      },
      {
        name: 'Data In'
      },
      {
        name: 'Data Out'
      },
      {
        name: 'Errors/min'
      },
      {
        name: 'Calls/min'
      }
    ];
    const chart = createHost(`<ht-radar-chart [axes]="axes"></ht-radar-chart>`, {
      hostProps: {
        axes: axes
      }
    });

    const axesGElement = chart.queryAll('.axis', { root: true });
    expect(axesGElement.length).toBe(5);

    axesGElement.forEach((axisElement, index) => {
      expect(axisElement.querySelector('.axis-title')).toHaveText(axes[index].name);
    });
  });

  test('should render all series', () => {
    const axes = [
      {
        name: 'Latency'
      },
      {
        name: 'Data In'
      }
    ];

    const series = [
      {
        name: 'Last Month',
        color: '#bebfc1',
        data: [
          {
            axis: 'Latency',
            value: 80
          },
          {
            axis: 'Data In',
            value: 80
          }
        ]
      },
      {
        name: 'This Month',
        color: '#084E8A',
        data: [
          {
            axis: 'Latency',
            value: 54
          },
          {
            axis: 'Data In',
            value: 60
          }
        ]
      }
    ];
    const chart = createHost(`<ht-radar-chart [axes]="axes" [series]="series"></ht-radar-chart>`, {
      hostProps: {
        axes: axes,
        series: series
      }
    });

    const seriesGElement = chart.queryAll('.series', { root: true });
    expect(seriesGElement.length).toBe(2);

    seriesGElement.forEach(seriesElement => {
      expect(seriesElement.querySelector('.radar-area')).toExist();
      const pointsGElements = seriesElement.querySelectorAll('.points');
      expect(pointsGElements.length).toEqual(1);

      const pointElements = seriesElement.querySelectorAll('.points > .point');
      expect(pointElements.length).toEqual(2);
    });
  });

  test('should propogate events correctly', fakeAsync(() => {
    const axes = [
      {
        name: 'Latency'
      },
      {
        name: 'Data In'
      }
    ];

    const series = [
      {
        name: 'Last Month',
        color: '#bebfc1',
        data: [
          {
            axis: 'Latency',
            value: 80
          },
          {
            axis: 'Data In',
            value: 80
          }
        ]
      },
      {
        name: 'This Month',
        color: '#084E8A',
        data: [
          {
            axis: 'Latency',
            value: 54
          },
          {
            axis: 'Data In',
            value: 60
          }
        ]
      }
    ];

    const onPointClicked = jest.fn();
    const onSeriesClicked = jest.fn();

    const spectator = createHost(
      `<ht-radar-chart [axes]="axes" [series]="series" (pointClicked)="onPointClicked($event)" (seriesClicked)="onSeriesClicked($event)"></ht-radar-chart>`,
      {
        hostProps: {
          axes: axes,
          series: series,
          onPointClicked: onPointClicked,
          onSeriesClicked: onSeriesClicked
        }
      }
    );

    spectator.tick();
    const seriesGElement = spectator.queryAll('.series', { root: true });

    seriesGElement.forEach((seriesElement, seriesIndex) => {
      const currentSeries = series[seriesIndex];

      // Send event on Series Path
      spectator.dispatchFakeEvent(seriesElement.querySelector('.radar-area')!, 'click', true);
      expect(onSeriesClicked).toHaveBeenLastCalledWith(currentSeries.name);

      // Send event on Series G
      spectator.dispatchFakeEvent(seriesElement, 'click');
      expect(onSeriesClicked).toHaveBeenLastCalledWith(currentSeries.name);

      const pointsGElements = seriesElement.querySelectorAll('.points');
      expect(pointsGElements.length).toEqual(1);

      const pointElements = seriesElement.querySelectorAll('.points > .point');
      expect(pointElements.length).toEqual(2);

      pointElements.forEach((pointElement, pointIndex) => {
        const currentPoint = currentSeries.data[pointIndex];

        // Send event on Series G
        spectator.dispatchFakeEvent(pointElement, 'click', true);
        spectator.tick();

        expect(onPointClicked).toHaveBeenLastCalledWith({
          point: currentPoint,
          seriesName: currentSeries.name
        });

        // Event should propogate and emit series clicked as well
        expect(onSeriesClicked).toHaveBeenLastCalledWith(currentSeries.name);
      });
    });
  }));

  test('should render correct number of levels', () => {
    const chart = createHost(`<ht-radar-chart [levels]="levels"></ht-radar-chart>`, {
      hostProps: {
        levels: 10
      }
    });

    const levels = chart.queryAll('.dotted-grid-circle', { root: true });
    expect(levels.length).toBe(9);

    const lastLevel = chart.query('.last-grid-circle', { root: true });
    expect(lastLevel).toExist();
  });

  test('should render legends correctly', () => {
    const axes = [
      {
        name: 'Latency'
      },
      {
        name: 'Data In'
      }
    ];

    const series = [
      {
        name: 'Last Month',
        color: '#bebfc1',
        data: [
          {
            axis: 'Latency',
            value: 80
          },
          {
            axis: 'Data In',
            value: 80
          }
        ]
      },
      {
        name: 'This Month',
        color: '#084E8A',
        data: [
          {
            axis: 'Latency',
            value: 54
          },
          {
            axis: 'Data In',
            value: 60
          }
        ]
      }
    ];
    const chart = createHost(`<ht-radar-chart [axes]="axes" [series]="series"></ht-radar-chart>`, {
      hostProps: {
        axes: axes,
        series: series
      }
    });

    const legendItemGElements = chart.queryAll('.legend-item', { root: true });
    expect(legendItemGElements.length).toBe(2);

    legendItemGElements.forEach((legendItem, index) => {
      expect(legendItem.querySelector('.legend-symbol')).toExist();
      expect(legendItem.querySelector('.legend-title')).toHaveText(series[index].name);
    });
  });

  test('should show tooltip correctly', () => {
    const axes = [
      {
        name: 'Latency'
      },
      {
        name: 'Data In'
      }
    ];

    const series = [
      {
        name: 'Last Month',
        color: '#bebfc1',
        data: [
          {
            axis: 'Latency',
            value: 80
          },
          {
            axis: 'Data In',
            value: 80
          }
        ],
        showPoints: false
      },
      {
        name: 'This Month',
        color: '#084E8A',
        data: [
          {
            axis: 'Latency',
            value: 54
          },
          {
            axis: 'Data In',
            value: 60
          }
        ]
      }
    ];
    const locationData = [
      {
        context: {
          color: '#bebfc1',
          data: [
            { axis: 'Latency', value: 80 },
            { axis: 'Data In', value: 80 }
          ],
          name: 'Last Month',
          showPoints: false
        },
        dataPoint: { axis: 'Latency', value: 80 },
        location: { x: 0, y: -0 }
      },
      {
        context: {
          color: '#084E8A',
          data: [
            { axis: 'Latency', value: 54 },
            { axis: 'Data In', value: 60 }
          ],
          name: 'This Month',
          showPoints: true
        },
        dataPoint: { axis: 'Latency', value: 54 },
        location: { x: 0, y: -0 }
      }
    ];

    const mockTooltipRef = {
      showWithData: jest.fn(),
      hide: jest.fn(),
      destroy: jest.fn()
    };

    const chart = createHost(
      `<ht-radar-chart [axes]="axes" [series]="series" [tooltipOption]="tooltipOption"></ht-radar-chart>`,
      {
        hostProps: {
          axes: axes,
          series: series,
          tooltipOption: {
            visible: true
          }
        },
        providers: [
          mockProvider(ChartTooltipBuilderService, {
            constructTooltip: jest.fn().mockReturnValue(mockTooltipRef)
          })
        ]
      }
    );

    // Should show tooltip on hover
    const plotElement = chart.query('.plot-section', { root: true });
    const axisTitleGElements = chart.queryAll('.axis-title', { root: true });
    chart.dispatchMouseEvent(axisTitleGElements[0], 'mousemove');
    expect(mockTooltipRef.showWithData).toHaveBeenCalledWith(plotElement, expect.objectContaining(locationData));

    expect(mockTooltipRef.hide).not.toHaveBeenCalled();

    chart.dispatchMouseEvent(axisTitleGElements[0], 'mouseleave');
    expect(mockTooltipRef.hide).toHaveBeenCalled();

    // Dispatch hover over any other element. Tooltip should still show
    const firstSeriesPoint = chart.query('.series .point', { root: true })!;
    chart.dispatchMouseEvent(firstSeriesPoint, 'mousemove');
    expect(mockTooltipRef.showWithData).toHaveBeenLastCalledWith(plotElement, expect.objectContaining(locationData));

    chart.dispatchMouseEvent(firstSeriesPoint, 'mouseleave');
    expect(mockTooltipRef.hide).toHaveBeenCalled();
  });
});
