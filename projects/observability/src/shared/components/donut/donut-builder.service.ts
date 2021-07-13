import { Injectable, Renderer2 } from '@angular/core';
import {
  ColorService,
  DomElementMeasurerService,
  DynamicComponentService,
  PartialBy,
  selector
} from '@hypertrace/common';
import { BaseType, Selection } from 'd3-selection';
import { arc, pie, PieArcDatum } from 'd3-shape';
import { isEmpty } from 'lodash-es';
import { LegendPosition, LegendSeries } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { DefaultChartTooltipRenderData } from '../utils/chart-tooltip/default/default-chart-tooltip.component';
import { D3UtilService } from '../utils/d3/d3-util.service';
import {
  Chart,
  ChartConfig,
  ChartDimensions,
  D3VisualizationBuilderService,
  TooltipOption
} from '../utils/d3/d3-visualization-builder.service';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { Donut, DonutCenter, DonutConfiguration, DonutSeries } from './donut';
import { DonutDataLookupStrategy } from './donut-data-lookup-strategy';

@Injectable({ providedIn: 'root' })
export class DonutBuilderService extends D3VisualizationBuilderService<
  Donut,
  DonutDimensions,
  InternalConfiguration,
  DonutConfiguration
> {
  private static readonly DONUT_CHART_SVG_CLASS: string = 'donut-svg';
  private static readonly DONUT_ARC_GROUP_CLASS: string = 'donut-arc-group';
  private static readonly DONUT_VALUE_TEXT_GROUP_CLASS: string = 'donut-value-text-group';
  private static readonly DONUT_VALUE_TITLE_CLASS: string = 'donut-value-title';
  private static readonly DONUT_VALUE_CLASS: string = 'donut-value';
  private static readonly DONUT_ARC_CLASS: string = 'donut-arc';

  private static readonly DONUT_PADDING_PX: number = 10;

  public constructor(
    d3: D3UtilService,
    measurer: DomElementMeasurerService,
    dynamicComponent: DynamicComponentService,
    chartTooltipBuilderService: ChartTooltipBuilderService,
    private readonly colorService: ColorService
  ) {
    super(d3, measurer, dynamicComponent, chartTooltipBuilderService);
  }

  protected decorateChartObject(chart: Chart): Donut {
    return chart;
  }

  protected updateVisualizationSize(
    visualizationContainer: DonutContainerSelection,
    dimensions: DonutDimensions
  ): void {
    visualizationContainer
      .select(selector(DonutBuilderService.DONUT_CHART_SVG_CLASS))
      .attr('width', dimensions.visualizationWidth)
      .attr('height', dimensions.visualizationHeight)
      .select(selector(DonutBuilderService.DONUT_ARC_GROUP_CLASS))
      .attr('transform', `translate(${dimensions.visualizationWidth / 2},${dimensions.visualizationHeight / 2})`)
      .selectAll<BaseType, DonutArcData>(selector(DonutBuilderService.DONUT_ARC_CLASS))
      .attr('d', arc<DonutArcData>().innerRadius(dimensions.donutInnerRadius).outerRadius(dimensions.donutOuterRadius));

    visualizationContainer
      .select(selector(DonutBuilderService.DONUT_VALUE_TITLE_CLASS))
      .attr('transform', `translate(0,-${dimensions.donutInnerRadius / 2})`);

    visualizationContainer
      .select(selector(DonutBuilderService.DONUT_VALUE_CLASS))
      .attr('transform', `translate(0,-${dimensions.donutInnerRadius / 4})`);
  }

  protected drawVisualization(
    visualizationContainer: DonutContainerSelection,
    config: InternalConfiguration,
    renderer: Renderer2
  ): void {
    const groupSelection = visualizationContainer
      .append('svg')
      .classed(DonutBuilderService.DONUT_CHART_SVG_CLASS, true)
      .append('g')
      .classed(DonutBuilderService.DONUT_ARC_GROUP_CLASS, true);

    this.drawArcs(groupSelection, config, renderer);

    if (config.center !== undefined) {
      const textGroupSelection = groupSelection
        .append('g')
        .classed(DonutBuilderService.DONUT_VALUE_TEXT_GROUP_CLASS, true);

      textGroupSelection
        .append('text')
        .classed(DonutBuilderService.DONUT_VALUE_TITLE_CLASS, true)
        .text(() => String(config.center!.title));

      textGroupSelection
        .append('text')
        .classed(DonutBuilderService.DONUT_VALUE_CLASS, true)
        .text(() => String(config.center!.value));
    }
  }

  private drawArcs(arcGroup: DonutGroupSelection, config: InternalConfiguration, renderer: Renderer2): void {
    const pieData = pie<Required<DonutSeries>>().value(series => series.value)(config.series);
    arcGroup
      .selectAll(selector(DonutBuilderService.DONUT_ARC_CLASS))
      .data(pieData)
      .join('path')
      .classed(DonutBuilderService.DONUT_ARC_CLASS, true)
      .attr('fill', arcDatum => arcDatum.data.color);

    this.maybeAddTooltipTracking(
      arcGroup.node() as SVGGElement,
      config,
      renderer,
      new DonutDataLookupStrategy(pieData),
      data => this.buildTooltipRenderableData(data)
    );
  }

  protected decorateDimensions(calculatedDimensions: ChartDimensions): DonutDimensions {
    let diameter = Math.min(calculatedDimensions.visualizationWidth, calculatedDimensions.visualizationHeight);

    diameter -= DonutBuilderService.DONUT_PADDING_PX;

    // Reduce visualization area to diameter
    calculatedDimensions.visualizationWidth = diameter;
    calculatedDimensions.visualizationHeight = diameter;

    return {
      ...calculatedDimensions,
      donutOuterRadius: diameter / 2,
      donutInnerRadius: (diameter / 2) * 0.72
    };
  }

  protected fillConfigurationDefaults(provided: DonutConfiguration): InternalConfiguration {
    const colorsRequired = provided.series.filter(series => isEmpty(series.color)).length;
    const colors = this.colorService.getColorPalette().forNColors(colorsRequired);

    return {
      series: provided.series.map(providedSeries => ({
        ...providedSeries,
        color: isEmpty(providedSeries.color) ? colors.shift()! : providedSeries.color!
      })),
      center: provided.center,
      legend: provided.legendPosition === undefined ? LegendPosition.None : provided.legendPosition,
      tooltipOption: provided.tooltipOption === undefined ? { title: '' } : provided.tooltipOption,
      displayLegendCounts: provided.displayLegendCounts ?? true
    };
  }

  protected getLegendEntries(config: InternalConfiguration): LegendSeries<PartialBy<DonutSeries, 'value'>>[] {
    return config.series.map(series => ({
      data: {
        name: series.name,
        color: series.color,
        value: config.displayLegendCounts ? series.value : undefined
      },
      name: series.name,
      color: series.color
    }));
  }

  private buildTooltipRenderableData(
    data: MouseLocationData<DonutSeries, undefined>[],
    title: string = ''
  ): DefaultChartTooltipRenderData | undefined {
    return {
      title: title,
      labeledValues: data.map(datum => ({
        label: datum.dataPoint.name,
        value: datum.dataPoint.value,
        color: datum.dataPoint.color!
      }))
    };
  }
}

type DonutContainerSelection = Selection<HTMLDivElement, unknown, null, undefined>;
type DonutGroupSelection = Selection<SVGGElement, unknown, null, undefined>;
type DonutArcData = PieArcDatum<Required<DonutSeries>>;

interface InternalConfiguration extends ChartConfig {
  series: Required<DonutSeries>[];
  center?: DonutCenter;
  legend: LegendPosition;
  tooltipOption?: TooltipOption;
  displayLegendCounts: boolean;
}

interface DonutDimensions extends ChartDimensions {
  donutOuterRadius: number;
  donutInnerRadius: number;
}
