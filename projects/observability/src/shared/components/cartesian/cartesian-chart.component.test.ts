import { Renderer2 } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { DomElementMeasurerService, selector } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { LegendPosition } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { CartesianChartComponent } from './cartesian-chart.component';
import { Axis, AxisLocation, AxisType, CartesianSeriesVisualizationType, ScaleType, Series } from './chart';
import { CartesianAxis } from './d3/axis/cartesian-axis';
import { CartesianNoDataMessage } from './d3/cartesian-no-data-message';
import { CartesianLegend } from './d3/legend/cartesian-legend';

describe('Cartesian Chart component', () => {
  // NOTE: tests need to query from root because angular abstraction does not support SVG
  const createHost = createHostFactory<CartesianChartComponent<[number | string, number]>, ChartHost>({
    component: CartesianChartComponent,
    providers: [
      mockProvider(ChartTooltipBuilderService, {
        constructTooltip: jest.fn().mockReturnValue({
          destroy: jest.fn()
        })
      }),
      mockProvider(DomElementMeasurerService, {
        measureSvgElement: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }),
        getComputedTextLength: () => 0
      }),
      mockProvider(Renderer2)
    ]
  });

  test('should render data', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [series]="series"></ht-cartesian-chart>`, {
      hostProps: {
        series: [
          {
            data: [[1, 2]],
            name: 'test series',
            color: 'blue',
            type: CartesianSeriesVisualizationType.Area
          }
        ]
      }
    });
    tick();
    expect(chart.queryAll('.data-series', { root: true }).length).toBe(1);

    chart.setHostInput({
      series: [
        {
          data: [[1, 2]],
          name: 'test series',
          color: 'blue',
          type: CartesianSeriesVisualizationType.Line
        },
        {
          data: [[3, 4]],
          name: 'test series 2 ',
          color: 'red',
          type: CartesianSeriesVisualizationType.Line
        }
      ]
    });
    tick();
    expect(chart.queryAll('.data-series', { root: true }).length).toBe(2);
  }));

  test('should render axes even with no series', fakeAsync(() => {
    const chart = createHost(
      `
        <ht-cartesian-chart [series]="series" [showXAxis]="true" [showYAxis]="true"></ht-cartesian-chart>
      `,
      {
        hostProps: {
          series: []
        }
      }
    );
    tick();
    expect(chart.queryAll(CartesianAxis.CSS_SELECTOR, { root: true }).length).toBe(2);
  }));

  test('should not render axes when set to false', fakeAsync(() => {
    const chart = createHost(
      `
        <ht-cartesian-chart [series]="series" [showXAxis]="false" [showYAxis]="false"></ht-cartesian-chart>
      `,
      {
        hostProps: {
          series: []
        }
      }
    );
    tick();
    expect(chart.queryAll(CartesianAxis.CSS_SELECTOR, { root: true }).length).toBe(0);
  }));

  test('should display no data message if not provided any data', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [series]="series"></ht-cartesian-chart>`, {
      hostProps: {
        series: []
      }
    });
    tick();
    expect(chart.queryAll(selector(CartesianNoDataMessage.CSS_CLASS), { root: true }).length).toBe(1);

    chart.setHostInput({
      series: [
        {
          data: [],
          name: 'test series',
          color: 'blue',
          type: CartesianSeriesVisualizationType.Line
        }
      ]
    });
    tick();
    expect(chart.queryAll(selector(CartesianNoDataMessage.CSS_CLASS), { root: true }).length).toBe(1);

    chart.setHostInput({
      series: [
        {
          data: [],
          name: 'test series',
          color: 'blue',
          type: CartesianSeriesVisualizationType.Line
        },
        {
          data: [[1, 2]],
          name: 'test series 2 ',
          color: 'red',
          type: CartesianSeriesVisualizationType.Line
        }
      ]
    });
    tick();
    expect(chart.queryAll(selector(CartesianNoDataMessage.CSS_CLASS), { root: true }).length).toBe(0);
  }));

  test('should render legend on bottom', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [legend]="legend"></ht-cartesian-chart>`, {
      hostProps: {
        legend: undefined
      }
    });
    expect(chart.queryAll(CartesianLegend.CSS_SELECTOR, { root: true }).length).toBe(0);

    chart.setHostInput({
      legend: LegendPosition.Bottom
    });
    tick();
    expect(chart.queryAll(CartesianLegend.CSS_SELECTOR, { root: true }).length).toBe(1);
  }));

  test('should render legend on top left', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [legend]="legend"></ht-cartesian-chart>`, {
      hostProps: {
        legend: undefined
      }
    });
    expect(chart.queryAll(CartesianLegend.CSS_SELECTOR, { root: true }).length).toBe(0);

    chart.setHostInput({
      legend: LegendPosition.TopLeft
    });
    tick();
    expect(chart.queryAll(CartesianLegend.CSS_SELECTOR, { root: true }).length).toBe(1);
  }));

  test('should render column chart', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [series]="series"></ht-cartesian-chart>`, {
      hostProps: {
        series: [
          {
            data: [[1, 2]],
            name: 'test series',
            color: 'blue',
            type: CartesianSeriesVisualizationType.Column
          }
        ]
      }
    });
    tick();
    const columnElements = chart.queryAll('.data-series > .columns-data-series', { root: true });

    expect(columnElements.length).toBe(1);
    const rectElement = (columnElements[0] as SVGElement).querySelector('.column');
    expect(rectElement).not.toBeNull();
    expect(rectElement!.getAttribute('fill')).toEqual('blue');
  }));

  test('should render stacked column chart', fakeAsync(() => {
    const chart = createHost(`<ht-cartesian-chart [series]="series"></ht-cartesian-chart>`, {
      hostProps: {
        series: [
          {
            data: [[1, 2]],
            name: 'test series 1',
            color: 'blue',
            type: CartesianSeriesVisualizationType.Column,
            stacking: true
          },
          {
            data: [[1, 6]],
            name: 'test series 2',
            color: 'red',
            type: CartesianSeriesVisualizationType.Column,
            stacking: true
          }
        ]
      }
    });

    tick();
    const dataSeriesElements = chart.queryAll('.data-series', { root: true });

    expect(dataSeriesElements.length).toBe(2);

    const rectElement1 = dataSeriesElements[0].querySelector('.columns-data-series > .column');
    expect(rectElement1).not.toBeNull();

    expect(rectElement1!.getAttribute('fill')).toEqual('blue');

    const rectElement2 = dataSeriesElements[1].querySelector('.columns-data-series > .column');
    expect(rectElement2).not.toBeNull();

    expect(rectElement2!.getAttribute('fill')).toEqual('red');
  }));

  test('should render column chart with band scale', fakeAsync(() => {
    const chart = createHost(
      `<ht-cartesian-chart [series]="series" [xAxisOption]="xAxisOption"></ht-cartesian-chart>`,
      {
        hostProps: {
          xAxisOption: {
            type: AxisType.X,
            location: AxisLocation.Bottom,
            scale: ScaleType.Band
          },
          yAxisOption: {
            type: AxisType.Y,
            location: AxisLocation.Left,
            scale: ScaleType.Linear
          },
          series: [
            {
              data: [['Category 1', 2]],
              name: 'test series',
              color: 'blue',
              type: CartesianSeriesVisualizationType.Column
            }
          ]
        }
      }
    );
    tick();
    const columnElements = chart.queryAll('.data-series > .columns-data-series', { root: true });

    expect(columnElements.length).toBe(1);
    const rectElement = (columnElements[0] as SVGElement).querySelector('.column');
    expect(rectElement).not.toBeNull();
    expect(rectElement!.getAttribute('fill')).toEqual('blue');
  }));
});

interface ChartHost {
  series: Series<[number | string, number]>[];
  legend: LegendPosition;
  xAxisOption: Axis;
  yAxisOption: Axis;
}
