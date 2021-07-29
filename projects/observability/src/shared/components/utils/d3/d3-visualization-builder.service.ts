import { ElementRef, Injector, Renderer2, TemplateRef, Type } from '@angular/core';
import { assertUnreachable, DomElementMeasurerService, DynamicComponentService, selector } from '@hypertrace/common';
import { ContainerElement, mouse, Selection } from 'd3-selection';
import { isEqual } from 'lodash-es';
import { LegendComponent, LegendLayout, LegendPosition, LegendSeries } from '../../legend/legend.component';
import { ChartTooltipBuilderService, ChartTooltipDataMapper } from '../chart-tooltip/chart-tooltip-builder.service';
import { ChartTooltipRef } from '../chart-tooltip/chart-tooltip-popover';
import { MouseDataLookupStrategy } from '../mouse-tracking/mouse-tracking';
import { D3UtilService } from './d3-util.service';

export abstract class D3VisualizationBuilderService<
  TChart extends Chart,
  TDimensions extends ChartDimensions,
  TInternalConfig extends ChartConfig,
  TPublicConfig
> {
  protected constructor(
    protected readonly d3: D3UtilService,
    protected readonly measurer: DomElementMeasurerService,
    protected readonly dynamicComponent: DynamicComponentService,
    protected readonly chartTooltipBuilderService: ChartTooltipBuilderService
  ) {}

  private tooltipRef?: ChartTooltipRef<unknown>;

  public build(element: ElementRef, injector: Injector, configuration: TPublicConfig): TChart {
    const renderer = this.getRenderer(injector);
    const parentSelection = this.d3.select<HTMLElement>(element, renderer);
    this.destroyAnyExistingChart(parentSelection);
    const chart = this.draw(parentSelection, injector, this.fillConfigurationDefaults(configuration, renderer));
    parentSelection.datum(chart);

    return chart;
  }

  protected abstract fillConfigurationDefaults(providedConfig: TPublicConfig, renderer: Renderer2): TInternalConfig;
  protected abstract decorateChartObject(basicChartObject: Chart, config: TInternalConfig): TChart;
  protected abstract getLegendEntries(config: TInternalConfig): LegendSeries<unknown>[];
  protected abstract updateVisualizationSize(
    visualizationContainer: ChartContainerSelection,
    dimensions: TDimensions,
    config: TInternalConfig,
    renderer: Renderer2
  ): void;

  protected abstract decorateDimensions(calculatedDimensions: ChartDimensions): TDimensions;

  protected abstract drawVisualization(
    visualizationContainer: ChartContainerSelection,
    config: TInternalConfig,
    renderer: Renderer2
  ): void;

  protected getOuterContainerClass(): string {
    return 'chart-container';
  }

  protected getLegendContainerClass(): string {
    return 'chart-legend-container';
  }

  protected getVisualizationContainerClass(): string {
    return 'chart-visualization-container';
  }

  protected draw(parentSelection: ChartParentSelection, injector: Injector, config: TInternalConfig): TChart {
    const renderer = this.getRenderer(injector);
    const outerContainer = this.drawOuterContainer(parentSelection, config);
    const visualizationContainer = outerContainer.append('div').classed(this.getVisualizationContainerClass(), true);
    const legendContainer = outerContainer.append('div').classed(this.getLegendContainerClass(), true);

    this.drawVisualization(visualizationContainer, config, renderer);
    this.drawLegend(legendContainer, injector, config);
    const dimensions = this.measure(parentSelection, config);
    this.updateSize(parentSelection, config, renderer, dimensions);

    return this.buildChartObject(parentSelection, config, renderer, dimensions);
  }

  protected updateSize(
    selection: ChartParentSelection,
    config: TInternalConfig,
    renderer: Renderer2,
    dimensions: TDimensions,
    oldDimensions?: TDimensions
  ): void {
    if (!this.haveDimensionsChanged(dimensions, oldDimensions)) {
      return;
    }

    this.updateLegendSize(selection.select(selector(this.getLegendContainerClass())), dimensions);
    this.updateVisualizationSize(
      selection.select(selector(this.getVisualizationContainerClass())),
      dimensions,
      config,
      renderer
    );
  }

  protected drawOuterContainer(
    parentSelection: ChartParentSelection,
    config: TInternalConfig
  ): ChartContainerSelection {
    return parentSelection
      .append('div')
      .classed(this.getOuterContainerClass(), true)
      .classed(this.getOuterContainerLayoutClass(config), true);
  }

  protected getOuterContainerLayoutClass(configuration: TInternalConfig): string {
    switch (configuration.legend) {
      case LegendPosition.Bottom:
        return 'column';
      case LegendPosition.Top:
      case LegendPosition.TopLeft:
      case LegendPosition.TopRight:
        return 'column-reverse';
      case LegendPosition.Right:
        return 'row';
      case LegendPosition.None:
        return '';
      default:
        return assertUnreachable(configuration.legend);
    }
  }

  protected drawLegend(legendContainer: ChartContainerSelection, injector: Injector, config: TInternalConfig): void {
    if (config.legend === LegendPosition.None) {
      return;
    }
    const component = this.dynamicComponent.insertComponent(
      legendContainer.node()!,
      LegendComponent,
      injector,
      LegendComponent.buildProviders({
        position: config.legend,
        layout: this.getLegendLayout(config),
        series: this.getLegendEntries(config)
      })
    );
    this.d3.select(component.location, this.getRenderer(injector));
    component.changeDetectorRef.detectChanges(); // Force change detection to get content size immediately
  }

  protected updateLegendSize(legendSelection: ChartContainerSelection, dimensions: TDimensions): void {
    legendSelection.style('width', `${dimensions.legendWidth}px`).style('height', `${dimensions.legendHeight}px`);
  }

  protected maybeAddTooltipTracking<TData, TContext, TRendererData>(
    container: ContainerElement,
    config: TInternalConfig,
    renderer: Renderer2,
    lookupStrategy: MouseDataLookupStrategy<TData, TContext>,
    mapper?: ChartTooltipDataMapper<TData, TContext, TRendererData>
  ): void {
    if (!config.tooltipOption) {
      return;
    }

    this.addTooltipTracking(container, renderer, lookupStrategy, mapper, config.tooltipOption?.component);
  }

  private addTooltipTracking<TData, TContext, TRendererData>(
    container: ContainerElement,
    renderer: Renderer2,
    lookupStrategy: MouseDataLookupStrategy<TData, TContext>,
    mapper?: ChartTooltipDataMapper<TData, TContext, TRendererData>,
    componentOrTemplate?: Type<unknown> | TemplateRef<unknown>
  ): void {
    this.maybeSetTooltipRef(mapper, componentOrTemplate);
    this.d3
      .select(container, renderer)
      .on('mousemove', () => this.onMouseMove<TData, TContext>(container, lookupStrategy))
      .on('mouseleave', () => this.onMouseLeave());
  }

  private onMouseMove<TData, TContext>(
    container: ContainerElement,
    lookupStrategy: MouseDataLookupStrategy<TData, TContext>
  ): void {
    const [x, y] = mouse(container);
    this.tooltipRef?.showWithData(container, lookupStrategy.dataForLocation({ x: x, y: y }));
  }

  private onMouseLeave(): void {
    this.tooltipRef?.hide();
  }

  private maybeSetTooltipRef<TData, TContext, TRendererData>(
    mapper?: ChartTooltipDataMapper<TData, TContext, TRendererData>,
    componentOrTemplate?: Type<unknown> | TemplateRef<unknown>
  ): void {
    if (this.tooltipRef !== undefined) {
      return;
    }
    this.tooltipRef = this.chartTooltipBuilderService.constructTooltip(mapper, componentOrTemplate);
  }

  protected clear(parentSelection: ChartParentSelection): void {
    parentSelection.selectAll(selector(this.getOuterContainerClass())).remove();
  }

  protected measure(parent: ChartParentSelection, config: TInternalConfig): TDimensions {
    const visualizationSelection = parent.select(selector(this.getVisualizationContainerClass()));
    const legendSelection = parent.select<HTMLElement>(selector(this.getLegendContainerClass()));
    const parentElement = parent.node();
    const legendElement = legendSelection.node();

    if (!parentElement || !legendElement) {
      throw Error('Elements must be drawn before being measured');
    }

    // Hide chart before measuring so previous size doesn't affect new measurement
    visualizationSelection.style('display', 'none');
    legendSelection.style('display', 'none');
    const outerRect = this.measurer.measureHtmlElement(parentElement);
    // tslint:disable-next-line: no-null-keyword
    legendSelection.style('display', null);
    const legendRect = this.measurer.measureHtmlElement(legendElement);
    // tslint:disable-next-line: no-null-keyword
    visualizationSelection.style('display', null);

    const isLegendVisible = this.isLegendVisible(config);
    const isTopOrBottomLegend = this.isTopOrBottomLegend(config);
    const isSideLegend = config.legend === LegendPosition.Right;
    let legendWidth = isLegendVisible
      ? 0
      : isSideLegend
      ? Math.min(this.getLegendWidth(outerRect.width), this.getMaxLegendWidth())
      : isTopOrBottomLegend
      ? outerRect.width
      : 0;

    let legendHeight = isLegendVisible
      ? 0
      : isTopOrBottomLegend
      ? Math.min(legendRect.height, this.getMaxLegendHeight())
      : isSideLegend
      ? outerRect.height
      : 0;

    const legendWidthOffset = isSideLegend ? legendWidth : 0;
    const legendHeightOffset = isTopOrBottomLegend ? legendHeight : 0;

    let vizWidth = outerRect.width - legendWidthOffset;
    let vizHeight = outerRect.height - legendHeightOffset;

    // Hide Legend if less space is available for the viz
    if (vizWidth <= legendWidthOffset || legendWidth <= 60) {
      vizWidth = outerRect.width;
      legendWidth = 0;
    }

    if (vizHeight <= legendHeightOffset || legendHeight <= 12) {
      vizHeight = outerRect.height;
      legendHeight = 0;
    }

    return this.decorateDimensions({
      visualizationWidth: vizWidth,
      visualizationHeight: vizHeight,
      legendWidth: legendWidth,
      legendHeight: legendHeight
    });
  }

  private getLegendWidth(outerRectWidth: number): number {
    return outerRectWidth >= 200 ? outerRectWidth * 0.35 : 0;
  }

  private isLegendVisible(config: ChartConfig): boolean {
    return config.legend === LegendPosition.None;
  }

  private isTopOrBottomLegend(config: ChartConfig): boolean {
    switch (config.legend) {
      case LegendPosition.Bottom:
      case LegendPosition.Top:
      case LegendPosition.TopLeft:
      case LegendPosition.TopRight:
        return true;
      case LegendPosition.Right:
      case LegendPosition.None:
      default:
        return false;
    }
  }

  protected getRenderer(injector: Injector): Renderer2 {
    return injector.get(Renderer2 as Type<Renderer2>);
  }

  protected destroyAnyExistingChart(parentSelection: ChartParentSelection): void {
    const existing = parentSelection.datum();
    if (this.isChartObject(existing)) {
      existing.destroy();
    }
  }

  protected isChartObject(value: unknown): value is TChart {
    return typeof value === 'object' && value !== null && typeof (value as Partial<TChart>).destroy === 'function';
  }

  protected haveDimensionsChanged(newDimensions: ChartDimensions, oldDimensions?: ChartDimensions): boolean {
    if (!oldDimensions) {
      return true;
    }

    return !isEqual(newDimensions, oldDimensions);
  }

  protected getLegendLayout(configuration: TInternalConfig): LegendLayout {
    switch (configuration.legend) {
      case LegendPosition.Right:
        return LegendLayout.Column;
      case LegendPosition.Top:
      case LegendPosition.TopRight:
      case LegendPosition.TopLeft:
      case LegendPosition.Bottom:
      case LegendPosition.None:
        return LegendLayout.Row;
      default:
        return assertUnreachable(configuration.legend);
    }
  }

  protected getMaxLegendWidth(): number {
    return 200;
  }

  protected getMaxLegendHeight(): number {
    return 120;
  }

  protected buildChartObject(
    parentSelection: ChartParentSelection,
    config: TInternalConfig,
    renderer: Renderer2,
    dimensions: TDimensions
  ): TChart {
    let currentDimensions = dimensions;

    return this.decorateChartObject(
      {
        reflow: () => {
          const oldDimensions = currentDimensions;
          currentDimensions = this.measure(parentSelection, config);
          this.updateSize(parentSelection, config, renderer, currentDimensions, oldDimensions);
        },
        destroy: () => this.clear(parentSelection)
      },
      config
    );
  }
}

export interface ChartDimensions {
  visualizationWidth: number;
  visualizationHeight: number;
  legendWidth: number;
  legendHeight: number;
}

export interface Chart {
  reflow(): void;
  destroy(): void;
}

export interface ChartConfig {
  legend: LegendPosition;
  tooltipOption?: TooltipOption;
}

export interface TooltipOption {
  title: string;
  /**
   * Todo: Currently only supports a component. This component
   * can inject hovered data points by injecting using token POPOVER_DATA
   */
  component?: Type<unknown>;
}

type ChartParentSelection = Selection<HTMLElement, unknown, null, undefined>;
type ChartContainerSelection = Selection<HTMLDivElement, unknown, null, undefined>;
