import { Injectable, Renderer2 } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ColorService, DomElementMeasurerService, DynamicComponentService, selector } from '@hypertrace/common';
import { ScaleContinuousNumeric } from 'd3-scale';
import { Selection } from 'd3-selection';
import { Observable, Subject } from 'rxjs';
import { LegendPosition, LegendSeries } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { D3UtilService } from '../utils/d3/d3-util.service';
import {
  Chart,
  ChartConfig,
  ChartDimensions,
  D3VisualizationBuilderService
} from '../utils/d3/d3-visualization-builder.service';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { BubbleChart, BubbleChartConfiguration, BubbleChartData } from './bubble-chart';
import { BubbleDataLookupStrategy } from './bubble-data-lookup-strategy';
import { BubbleScaleBuilder } from './bubble-scale-builder';
import { ContainLayout } from './contain-layout';
import { EasyRect, ScaledLayout } from './scaled-layout';

@Injectable({ providedIn: 'root' })
export class BubbleChartBuilderService<TData extends BubbleChartData> extends D3VisualizationBuilderService<
  BubbleChart<TData>,
  ChartDimensions,
  InternalConfiguration<TData>,
  BubbleChartConfiguration<TData>
> {
  private static readonly SVG_CLASS: string = 'bubble-chart-svg';
  private static readonly DATA_GROUP_CLASS: string = 'bubble-chart-data';
  private static readonly BUBBLE_GROUP_CLASS: string = 'bubble-group';
  private static readonly DATA_BUBBLE_CLASS: string = 'data-bubble';
  private static readonly CHECKMARK_GROUP_CLASS: string = 'checkmark-group';
  private static readonly CHECKMARK_SVG_CONTAINER_CLASS: string = 'checkmark-svg-container';

  private readonly bubbleScaleBuilder: BubbleScaleBuilder = new BubbleScaleBuilder();
  private readonly containLayout: ContainLayout = new ContainLayout(this.bubbleScaleBuilder);

  private static readonly CHECKMARK_ICON_TYPE: IconType = IconType.Checkmark;
  private static readonly MAX_CHECKMARK_ICON_SIZE: number = 20;
  private static readonly BUBBLE_CHART_PADDING: BubbleChartPadding = {
    right: 2,
    bottom: 2
  };

  public constructor(
    d3: D3UtilService,
    measurer: DomElementMeasurerService,
    dynamicComponent: DynamicComponentService,
    private readonly colorService: ColorService,
    chartTooltipBuilderService: ChartTooltipBuilderService
  ) {
    super(d3, measurer, dynamicComponent, chartTooltipBuilderService);
  }

  protected drawVisualization(
    visualizationContainer: BubbleChartContainer,
    config: InternalConfiguration<TData>
  ): void {
    const bubbleGroupsSelection = visualizationContainer
      .append('svg')
      .classed(BubbleChartBuilderService.SVG_CLASS, true)
      .append('g')
      .classed(BubbleChartBuilderService.DATA_GROUP_CLASS, true)
      .selectAll<SVGGElement, DefaultedBubbleChartData<TData>>(selector(BubbleChartBuilderService.BUBBLE_GROUP_CLASS))
      .data(config.data)
      .join('g')
      .classed(BubbleChartBuilderService.BUBBLE_GROUP_CLASS, true);

    bubbleGroupsSelection.each((data, index, bubbleGroupElements) => {
      config.dataToBubbleGroupElement.set(data.original, bubbleGroupElements[index]);
    });

    bubbleGroupsSelection
      .append('circle')
      .classed(BubbleChartBuilderService.DATA_BUBBLE_CLASS, true)
      .attr('fill', data => data.color);

    const checkmarkSvgsSelection = bubbleGroupsSelection
      .append('g')
      .classed(BubbleChartBuilderService.CHECKMARK_GROUP_CLASS, true)
      .append('svg')
      .classed(BubbleChartBuilderService.CHECKMARK_SVG_CONTAINER_CLASS, true);

    this.updateBubblesUsingCurrentSelections(config);

    this.addCheckmarkIcon(
      checkmarkSvgsSelection,
      config.domRenderer,
      this.d3.buildIcon(BubbleChartBuilderService.CHECKMARK_ICON_TYPE, config.domRenderer)
    );

    this.addClickHandler(bubbleGroupsSelection, config);
  }

  protected updateVisualizationSize(
    visualizationContainer: BubbleChartContainer,
    dimensions: ChartDimensions,
    config: InternalConfiguration<TData>,
    renderer: Renderer2
  ): void {
    const scaledLayout = this.getScaledLayout(config, dimensions);

    const xScale = this.bubbleScaleBuilder.getXScale(
      config.data,
      scaledLayout,
      config.constraint.xMin,
      config.constraint.xMax
    );
    const yScale = this.bubbleScaleBuilder.getYScale(
      config.data,
      scaledLayout,
      config.constraint.yMin,
      config.constraint.yMax
    );
    const rScale = this.bubbleScaleBuilder.getRScale(scaledLayout, xScale, yScale);

    const bubbleGroupsSelection = visualizationContainer
      .select(selector(BubbleChartBuilderService.SVG_CLASS))
      .attr('width', dimensions.visualizationWidth)
      .attr('height', dimensions.visualizationHeight)
      .select(selector(BubbleChartBuilderService.DATA_GROUP_CLASS))
      .selectAll<SVGGElement, DefaultedBubbleChartData<TData>>(selector(BubbleChartBuilderService.BUBBLE_GROUP_CLASS));

    bubbleGroupsSelection
      .select(selector(BubbleChartBuilderService.DATA_BUBBLE_CLASS))
      .attr('r', data => rScale(data.r)!)
      .attr('cx', data => xScale(data.x)!)
      .attr('cy', data => yScale(data.y)!);

    this.maybeAddTooltipTracking(
      visualizationContainer.node()!,
      config,
      renderer,
      this.buildLookupStrategy(config.data, xScale, yScale),
      data => this.buildTooltipRenderableData(data)
    );

    const checkmarkGroupsSelection = bubbleGroupsSelection.selectAll<SVGGElement, DefaultedBubbleChartData<TData>>(
      selector(BubbleChartBuilderService.CHECKMARK_GROUP_CLASS)
    );

    this.updateCheckmarkIconAttributes(checkmarkGroupsSelection, rScale, xScale, yScale);
  }

  protected fillConfigurationDefaults(
    provided: BubbleChartConfiguration<TData>,
    renderer: Renderer2
  ): InternalConfiguration<TData> {
    const colorMap = this.buildColorLookupForData(provided);
    const data = provided.data
      .map(providedData => ({
        x: providedData.x,
        y: providedData.y,
        r: providedData.r,
        color: colorMap.get(providedData.colorKey)!,
        original: providedData
      }))
      .sort((first, second) => second.r - first.r); // Sort larger r values earlier so they render beneath smaller values

    const constraint: BubbleChartConstraint = {
      xMin: provided.xMin,
      xMax: provided.xMax,
      yMin: provided.yMin,
      yMax: provided.yMax
    };

    const maxAllowedSelectionsCount = provided.maxAllowedSelectionsCount ?? data.length;

    return {
      colorMap: colorMap,
      data: data,
      legend: LegendPosition.Right,
      constraint: constraint,
      selectionsSubject: new Subject(),
      tooltipOption: provided.tooltipOption,
      dataToBubbleGroupElement: new Map(),
      currentSelections: provided.selections
        ? new Set(provided.selections.slice(0, maxAllowedSelectionsCount))
        : new Set(),
      maxAllowedSelectionsCount: maxAllowedSelectionsCount,
      domRenderer: renderer
    };
  }

  private buildLookupStrategy(
    data: DefaultedBubbleChartData<TData>[],
    xScale: NumericScale,
    yScale: NumericScale
  ): BubbleDataLookupStrategy<DefaultedBubbleChartData<TData>> {
    return new BubbleDataLookupStrategy<DefaultedBubbleChartData<TData>>(data, xScale, yScale);
  }

  private buildTooltipRenderableData(
    data: MouseLocationData<DefaultedBubbleChartData<TData>, undefined>[]
  ): TData[] | undefined {
    return data.map(mouseLocationData => mouseLocationData.dataPoint.original);
  }

  protected getLegendEntries(config: InternalConfiguration<TData>): LegendSeries<unknown>[] {
    return Array.from(config.colorMap.entries()).map(([key, color]) => ({
      name: key,
      color: color,
      data: key
    }));
  }

  protected decorateChartObject(chart: Chart, config: InternalConfiguration<TData>): BubbleChart<TData> {
    return {
      reflow: chart.reflow,
      destroy: () => {
        config.dataToBubbleGroupElement.clear();
        config.currentSelections.clear();
        config.selectionsSubject.complete();
        chart.destroy();
      },
      selections$: config.selectionsSubject.asObservable(),
      updateSelections: (selections: TData[]): void => {
        config.currentSelections = new Set(selections.slice(0, config.maxAllowedSelectionsCount));
        this.updateBubblesUsingCurrentSelections(config);
      }
    };
  }

  protected decorateDimensions(dimensions: ChartDimensions): ChartDimensions {
    return dimensions;
  }

  private updateBubblesUsingCurrentSelections(config: InternalConfiguration<TData>): void {
    config.dataToBubbleGroupElement.forEach((value, key) => {
      this.d3.select(value, config.domRenderer).classed('active', config.currentSelections.has(key));
    });
  }

  private addClickHandler(
    bubbleGroupsSelection: BubbleGroupsSelection<TData>,
    config: InternalConfiguration<TData>
  ): void {
    bubbleGroupsSelection.on('click', (data, index, bubbleGroupElements) => {
      if (config.currentSelections.has(data.original)) {
        config.currentSelections.delete(data.original);
        config.selectionsSubject.next(new Set(config.currentSelections));
        config.domRenderer.removeClass(bubbleGroupElements[index], 'active');
      } else if (config.currentSelections.size < config.maxAllowedSelectionsCount) {
        config.selectionsSubject.next(new Set(config.currentSelections.add(data.original)));
        config.domRenderer.addClass(bubbleGroupElements[index], 'active');
      }
    });
  }

  private buildColorLookupForData(provided: BubbleChartConfiguration<TData>): Map<string, string> {
    const uniqueDataValues = new Set(provided.data.map(data => data.colorKey));
    if (provided.determineColor) {
      return new Map(Array.from(uniqueDataValues).map(value => [value, provided.determineColor!(value)]));
    }
    const colors = this.colorService.getColorPalette().forNColors(uniqueDataValues.size);

    return new Map(Array.from(uniqueDataValues).map((value, index) => [value, colors[index]]));
  }

  private getScaledLayout(config: InternalConfiguration<TData>, dimensions: ChartDimensions): ScaledLayout {
    const dimensionsRect: EasyRect = {
      width: dimensions.visualizationWidth - BubbleChartBuilderService.BUBBLE_CHART_PADDING.right,
      height: dimensions.visualizationHeight - BubbleChartBuilderService.BUBBLE_CHART_PADDING.bottom
    };

    return this.containLayout.getLayout(
      config.data,
      dimensionsRect,
      config.constraint.xMin,
      config.constraint.xMax,
      config.constraint.yMin,
      config.constraint.yMax
    );
  }

  private addCheckmarkIcon(
    checkmarkSvgsSelection: CheckmarkSvgsSelection<TData>,
    renderer: Renderer2,
    iconContent$: Observable<SVGElement>
  ): void {
    checkmarkSvgsSelection.each((_, index, checkmarkSvgElements) => {
      iconContent$.subscribe(iconContent => {
        renderer.appendChild(checkmarkSvgElements[index], iconContent);
      });
    });
  }

  private updateCheckmarkIconAttributes(
    checkmarkGroupsSelection: CheckmarkGroupsSelection<TData>,
    rScale: ScaleContinuousNumeric<number, number>,
    xScale: ScaleContinuousNumeric<number, number>,
    yScale: ScaleContinuousNumeric<number, number>
  ): void {
    checkmarkGroupsSelection
      .attr(
        'transform',
        data =>
          `translate(
            -${this.getCheckmarkIconSize(rScale(data.r)!) / 2},
            -${this.getCheckmarkIconSize(rScale(data.r)!) / 2}
          )`
      )
      .select(selector(BubbleChartBuilderService.CHECKMARK_SVG_CONTAINER_CLASS))
      .attr('x', data => xScale(data.x)!)
      .attr('y', data => yScale(data.y)!)
      .attr('width', data => this.getCheckmarkIconSize(rScale(data.r)!))
      .attr('height', data => this.getCheckmarkIconSize(rScale(data.r)!))
      .style('font-size', data => `${this.getCheckmarkIconSize(rScale(data.r)!)}px`);
  }

  private getCheckmarkIconSize(radius: number): number {
    return Math.min(radius * 0.9, BubbleChartBuilderService.MAX_CHECKMARK_ICON_SIZE);
  }
}

interface BubbleChartConstraint {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}

interface DefaultedBubbleChartData<T extends BubbleChartData> {
  x: number;
  y: number;
  r: number;
  color: string;
  original: T;
}

interface InternalConfiguration<T extends BubbleChartData> extends ChartConfig {
  legend: LegendPosition;
  colorMap: Map<string, string>;
  data: DefaultedBubbleChartData<T>[];
  constraint: BubbleChartConstraint;
  selectionsSubject: Subject<Set<T>>;
  currentSelections: Set<T>;
  dataToBubbleGroupElement: Map<T, SVGGElement>;
  maxAllowedSelectionsCount: number;
  domRenderer: Renderer2;
}

interface BubbleChartPadding {
  right: number;
  bottom: number;
}

type BubbleChartContainer = Selection<HTMLDivElement, unknown, null, undefined>;
type NumericScale = ScaleContinuousNumeric<number, number>;
type CheckmarkSvgsSelection<T extends BubbleChartData> = Selection<
  SVGSVGElement,
  DefaultedBubbleChartData<T>,
  SVGGElement,
  unknown
>;
type CheckmarkGroupsSelection<T extends BubbleChartData> = Selection<
  SVGGElement,
  DefaultedBubbleChartData<T>,
  SVGGElement,
  unknown
>;
type BubbleGroupsSelection<T extends BubbleChartData> = Selection<
  SVGGElement,
  DefaultedBubbleChartData<T>,
  SVGGElement,
  unknown
>;
