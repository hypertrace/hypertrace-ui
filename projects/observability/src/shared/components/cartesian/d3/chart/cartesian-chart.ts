import { Injector, Renderer2 } from '@angular/core';
import { TimeRange } from '@hypertrace/common';
import { brush, BrushBehavior, D3BrushEvent } from 'd3-brush';
import { ContainerElement, mouse, select } from 'd3-selection';
import { LegendPosition } from '../../../legend/legend.component';
import { ChartTooltipRef } from '../../../utils/chart-tooltip/chart-tooltip-popover';
import { D3UtilService } from '../../../utils/d3/d3-util.service';
import { MouseLocationData } from '../../../utils/mouse-tracking/mouse-tracking';
import { SvgUtilService } from '../../../utils/svg/svg-util.service';
import {
  Axis,
  AxisType,
  Band,
  CartesianChart,
  CartesianSeriesVisualizationType,
  RenderingStrategy,
  Series,
  Summary
} from '../../chart';
import { ChartEvent, ChartEventListener, ChartTooltipTrackingOptions } from '../../chart-interactivty';
import { CartesianAxis } from '../axis/cartesian-axis';
import { CartesianNoDataMessage } from '../cartesian-no-data-message';
import { CartesianBand } from '../data/band/cartesian-band';
import { CartesianData } from '../data/cartesian-data';
import { CartesianArea } from '../data/series/cartesian-area';
import { CartesianColumn } from '../data/series/cartesian-column';
import { CartesianDashedLine } from '../data/series/cartesian-dashed-line';
import { CartesianLine } from '../data/series/cartesian-line';
import { CartesianPoints } from '../data/series/cartesian-points';
import { CartesianSeries } from '../data/series/cartesian-series';
import { CartesianIntervalData } from '../legend/cartesian-interval-control.component';
import { CartesianLegend } from '../legend/cartesian-legend';
import { ScaleBounds } from '../scale/cartesian-scale';
import { CartesianScaleBuilder } from '../scale/cartesian-scale-builder';

import { event as _d3CurrentEvent } from 'd3-selection';

// tslint:disable:max-file-line-count
export class DefaultCartesianChart<TData> implements CartesianChart<TData> {
  public static DATA_SERIES_CLASS: string = 'data-series';

  protected readonly margin: number = 16;
  protected readonly axisHeight: number = 16;
  protected readonly axisWidth: number = 32; // Untested. We don't use Y-Axis anywhere and the number should really be dynamic

  // Updated on draw
  protected chartContainerElement?: Element;
  protected chartBackgroundSvgElement?: SVGSVGElement;
  protected dataElement?: ContainerElement;
  protected mouseEventContainer?: SVGSVGElement;
  protected legend?: CartesianLegend;
  protected tooltip?: ChartTooltipRef<TData>;
  protected allSeriesData: CartesianData<TData, Series<TData>>[] = [];
  protected allCartesianData: CartesianData<TData, Series<TData> | Band<TData>>[] = [];
  protected renderedAxes: CartesianAxis<TData>[] = [];
  protected scaleBuilder: CartesianScaleBuilder<TData> = CartesianScaleBuilder.newBuilder();

  // Provided by user
  protected legendPosition?: LegendPosition;
  protected timeRange?: TimeRange;
  protected readonly requestedAxes: Axis[] = [];
  protected intervalData?: CartesianIntervalData;
  protected readonly series: Series<TData>[] = [];
  protected readonly seriesSummaries: Summary[] = [];
  protected readonly bands: Band<TData>[] = [];
  protected readonly eventListeners: {
    event: ChartEvent;
    onEvent: ChartEventListener<TData>;
  }[] = [];

  protected readonly brushBehaviour: BrushBehavior<unknown>;

  public constructor(
    protected readonly hostElement: Element,
    protected readonly injector: Injector,
    protected readonly renderingStrategy: RenderingStrategy,
    protected readonly svgUtilService: SvgUtilService,
    protected readonly d3Utils: D3UtilService,
    protected readonly domRenderer: Renderer2
  ) {
    this.brushBehaviour = brush<unknown>().on('end', () => this.onBrushSelection(_d3CurrentEvent));
  }

  protected onBrushSelection(event: D3BrushEvent<unknown>): void {
    if (!event.selection) {
      return;
    }

    const [start, end] = event.selection as [[number, number], [number, number]];

    let fromdata: any = this.allSeriesData.flatMap(viz => viz.dataForLocation({ x: start[0], y: start[1] }));
    let todata: any = this.allSeriesData.flatMap(viz => viz.dataForLocation({ x: end[0], y: end[1] }));

    this.eventListeners.forEach(listener => {
      listener.onEvent({ start: fromdata[0].dataPoint.timestamp, end: todata[0].dataPoint.timestamp } as any);
    });
  }

  public destroy(): this {
    this.clear();

    this.tooltip && this.tooltip.destroy();
    this.legend && this.legend.destroy();

    return this;
  }

  public draw(): this {
    this.clear();
    this.drawContainer();
    this.updateData();

    return this;
  }

  public isDrawn(): boolean {
    return !!this.chartBackgroundSvgElement;
  }

  public withLegend(legendPosition: LegendPosition): this {
    this.legendPosition = legendPosition;

    return this;
  }

  public withSeries(...series: Series<TData>[]): this {
    this.series.length = 0;
    this.series.push(...series);

    this.seriesSummaries.length = 0;
    this.seriesSummaries.push(
      ...series.map(s => s.summary).filter((summary): summary is Summary => summary !== undefined)
    );

    this.scaleBuilder = this.scaleBuilder.withSeries(series);

    return this;
  }

  public withBands(...bands: Band<TData>[]): this {
    this.bands.length = 0;
    this.bands.push(...bands);

    this.scaleBuilder = this.scaleBuilder.withBands(bands);

    return this;
  }

  public withEventListener(eventType: ChartEvent, listener: ChartEventListener<TData>): this {
    this.eventListeners.push({
      event: eventType,
      onEvent: listener
    });

    return this;
  }

  public withAxis(axis: Axis): this {
    this.requestedAxes.push(axis);
    this.scaleBuilder = this.scaleBuilder.withAxis(axis);

    return this;
  }

  public withTooltip(tooltip: ChartTooltipRef<TData>): this {
    this.tooltip = tooltip;

    return this;
  }

  public withTimeRange(timeRange: TimeRange): this {
    this.timeRange = timeRange;
    this.scaleBuilder = this.scaleBuilder.withDefaultXRange({
      min: this.timeRange.startTime.getTime(),
      max: this.timeRange.endTime.getTime()
    });

    return this;
  }

  public withIntervalData(intervalData: CartesianIntervalData): this {
    this.intervalData = intervalData;

    return this;
  }

  protected drawData(): void {
    switch (this.renderingStrategy) {
      case RenderingStrategy.Canvas:
        this.drawDataCanvas(this.buildCanvasContext());
        break;
      case RenderingStrategy.Auto:
      case RenderingStrategy.Svg:
      default:
        this.drawDataSvg();
    }
  }

  protected drawDataSvg(): void {
    this.dataElement = select(this.chartBackgroundSvgElement!).append('g').node()!;

    select(this.dataElement).selectAll('*').remove();

    const seriesElements = select(this.dataElement)
      .selectAll(`.${DefaultCartesianChart.DATA_SERIES_CLASS}`)
      .data(this.allCartesianData);

    seriesElements
      .enter()
      .append('g')
      .classed(DefaultCartesianChart.DATA_SERIES_CLASS, true)
      .each((seriesViz, index, elements) => seriesViz.drawSvg(elements[index]));

    seriesElements.exit().remove();
  }

  protected drawDataCanvas(context: CanvasRenderingContext2D): void {
    this.allCartesianData.forEach(visualization => visualization.drawCanvas(context));
  }

  protected getChartBox(): Pick<ClientRect, 'top' | 'left' | 'width' | 'height'> {
    const overallBox = this.hostElement.getBoundingClientRect();

    const legendElement = this.legend && this.legend.element();
    if (!legendElement) {
      return overallBox;
    }

    const legendBox = legendElement.getBoundingClientRect();

    switch (this.legendPosition) {
      case LegendPosition.Right:
        return {
          top: 0,
          left: 0,
          width: overallBox.width - legendBox.width,
          height: overallBox.height
        };
      case LegendPosition.Top:
      case LegendPosition.TopLeft:
      case LegendPosition.TopRight:
      case LegendPosition.None:
        return {
          top: legendBox.height,
          left: 0,
          width: overallBox.width,
          height: overallBox.height - legendBox.height
        };
      case LegendPosition.Bottom:
      default:
        return {
          top: 0,
          left: 0,
          width: overallBox.width,
          height: overallBox.height - legendBox.height
        };
    }
  }

  protected calculateRange(axisType: AxisType): [number, number] {
    const { width, height } = this.getChartBox();

    switch (axisType) {
      case AxisType.Y:
        return [this.hasXAxis() ? height - (this.margin + this.axisHeight) : height - this.margin, this.margin];
      default:
      case AxisType.X:
        return [this.hasYAxis() ? this.axisWidth : 0, width];
    }
  }

  protected setupEventListeners(): void {
    if (!this.mouseEventContainer || !this.dataElement) {
      return;
    }

    const eventContainer = select(this.mouseEventContainer);

    eventContainer.on('mousemove', () => this.onMouseMove()).on('mouseleave', () => this.onMouseLeave());

    this.eventListeners.forEach(listener =>
      eventContainer.on(this.getNativeEventName(listener.event), () =>
        listener.onEvent(this.getMouseDataForCurrentEvent())
      )
    );
  }

  protected clear(): void {
    if (this.chartContainerElement) {
      select(this.chartContainerElement).remove();

      this.chartContainerElement = undefined;
    }
  }

  private updateData(): void {
    this.drawLegend();
    this.buildVisualizations();
    this.drawChartBackground();
    this.drawAxes();
    this.drawData();
    this.addNoDataMessageIfNeeded();
    this.moveDataOnTopOfAxes();
    this.drawMouseEventContainer();
    this.setupEventListeners();
    this.attachBrush();
  }

  private attachBrush(): void {
    const { width, height } = this.hostElement.getBoundingClientRect();
    this.brushBehaviour.extent([
      [0, 0],
      [width, height]
    ]);

    select(this.mouseEventContainer!)
      .append('g')
      .attr('class', 'brush')
      .call(this.brushBehaviour as any);
  }

  private moveDataOnTopOfAxes(): void {
    if (!this.dataElement) {
      return;
    }

    this.dataElement.parentNode!.appendChild(this.dataElement);
  }

  private drawContainer(): void {
    if (this.chartContainerElement) {
      select(this.chartContainerElement).remove();
    }

    const { width, height } = this.hostElement.getBoundingClientRect();

    this.chartContainerElement = select(this.hostElement)
      .append('div')
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .node()!;
  }

  private hasXAxis(): boolean {
    return this.requestedAxes.some(axis => axis.type === AxisType.X);
  }

  private hasYAxis(): boolean {
    return this.requestedAxes.some(axis => axis.type === AxisType.Y);
  }

  private drawAxes(): void {
    if (!this.chartBackgroundSvgElement) {
      return;
    }

    select(this.chartBackgroundSvgElement).selectAll(CartesianAxis.CSS_SELECTOR).remove();

    this.renderedAxes = this.requestedAxes.map(
      requestedAxis => new CartesianAxis<TData>(requestedAxis, this.scaleBuilder, this.svgUtilService)
    );

    const axisElements = select(this.chartBackgroundSvgElement)
      .selectAll(CartesianAxis.CSS_SELECTOR)
      .data(this.renderedAxes);
    axisElements.enter().each((axis, index, elements) => axis.draw(elements[index]));

    axisElements.exit().remove();
  }

  private addNoDataMessageIfNeeded(): void {
    if (!this.chartBackgroundSvgElement) {
      return;
    }

    new CartesianNoDataMessage(this.chartBackgroundSvgElement, this.series).updateMessage();
  }

  private drawLegend(): void {
    if (this.chartContainerElement) {
      if (this.legendPosition !== undefined && this.legendPosition !== LegendPosition.None) {
        this.legend = new CartesianLegend(this.series, this.injector, this.intervalData, this.seriesSummaries).draw(
          this.chartContainerElement,
          this.legendPosition
        );
      } else {
        // The legend also contains the interval selector, so even without a legend we need to create an element for that
        this.legend = new CartesianLegend([], this.injector, this.intervalData, this.seriesSummaries).draw(
          this.chartContainerElement,
          LegendPosition.None
        );
      }
    }

    // Drawing a legend changes scale bounds
    this.scaleBuilder = this.scaleBuilder.withBounds(this.buildScaleBounds());
  }

  private drawChartBackground(): void {
    if (!this.chartContainerElement) {
      return;
    }

    const chartBox = this.getChartBox();

    this.chartBackgroundSvgElement = select(this.chartContainerElement)
      .append('svg')
      .style('position', 'absolute')
      .attr('width', `${chartBox.width}px`)
      .attr('height', `${chartBox.height}px`)
      .style('top', `${chartBox.top}px`)
      .style('left', `${chartBox.left}px`)
      .node()!;
  }

  private buildCanvasContext(): CanvasRenderingContext2D {
    const chartBox = this.getChartBox();
    const canvas = select(this.chartContainerElement!)
      .append('canvas')
      .style('position', 'absolute')
      .attr('width', chartBox.width)
      .attr('height', chartBox.height)
      .style('top', `${chartBox.top}px`)
      .style('left', `${chartBox.left}px`)
      .node()!;

    const context = canvas.getContext('2d')!;

    context.clearRect(0, 0, canvas.width, canvas.height);

    this.dataElement = canvas;

    return context;
  }

  private drawMouseEventContainer(): void {
    if (!this.chartBackgroundSvgElement) {
      return;
    }

    this.mouseEventContainer = select(this.chartBackgroundSvgElement).clone().raise().node()!;
  }

  private getMouseDataForCurrentEvent(): MouseLocationData<TData, Series<TData> | Band<TData>>[] {
    if (!this.dataElement) {
      return [];
    }

    const location = mouse(this.dataElement);

    return this.allSeriesData.flatMap(viz => viz.dataForLocation({ x: location[0], y: location[1] }));
  }

  private getNativeEventName(chartEvent: ChartEvent): string {
    switch (chartEvent) {
      case ChartEvent.Click:
        return 'click';
      case ChartEvent.DoubleClick:
        return 'dblclick';
      case ChartEvent.DoubleClick:
        return 'select';
      case ChartEvent.RightClick:
        return 'contextmenu';
      default:
        return '';
    }
  }

  private buildVisualizations(): void {
    this.allSeriesData = [
      ...this.series.map(series => this.getChartSeriesVisualization(series)),
      ...this.bands.flatMap(band => [
        // Need to add bands as series to get tooltips
        this.getChartSeriesVisualization(band.upper),
        this.getChartSeriesVisualization(band.lower)
      ])
    ];

    this.allCartesianData = [
      ...this.bands.map(
        band =>
          new CartesianBand(this.d3Utils, this.domRenderer, band, this.scaleBuilder, this.getTooltipTrackingStrategy())
      ),
      ...this.allSeriesData
    ];
  }

  private getChartSeriesVisualization(series: Series<TData>): CartesianSeries<TData> {
    switch (series.type) {
      case CartesianSeriesVisualizationType.Area:
        return new CartesianArea(series, this.scaleBuilder, this.getTooltipTrackingStrategy());
      case CartesianSeriesVisualizationType.Scatter:
        return new CartesianPoints(series, this.scaleBuilder, this.getTooltipTrackingStrategy());
      case CartesianSeriesVisualizationType.Column:
        return new CartesianColumn(series, this.scaleBuilder, this.getTooltipTrackingStrategy());
      case CartesianSeriesVisualizationType.DashedLine:
        return new CartesianDashedLine(series, this.scaleBuilder, this.getTooltipTrackingStrategy());
      case CartesianSeriesVisualizationType.Line:
      default:
        return new CartesianLine(series, this.scaleBuilder, this.getTooltipTrackingStrategy());
    }
  }

  private buildScaleBounds(): ScaleBounds {
    const [startX, endX] = this.calculateRange(AxisType.X);
    const [startY, endY] = this.calculateRange(AxisType.Y);

    return {
      startX: startX,
      endX: endX,
      startY: startY,
      endY: endY
    };
  }

  private getTooltipTrackingStrategy(): ChartTooltipTrackingOptions {
    return {
      followSingleAxis: AxisType.X
    };
  }

  private onMouseMove(): void {
    const locationData = this.getMouseDataForCurrentEvent();
    if (this.tooltip) {
      this.tooltip.showWithData(this.mouseEventContainer!, locationData);
    }

    this.renderedAxes.forEach(axis => axis.onMouseMove(locationData));
  }

  private onMouseLeave(): void {
    if (this.tooltip) {
      this.tooltip.hide();
    }

    this.renderedAxes.forEach(axis => axis.onMouseLeave());
  }
}
