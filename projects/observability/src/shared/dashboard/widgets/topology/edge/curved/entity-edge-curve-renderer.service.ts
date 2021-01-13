import { Injectable, Renderer2 } from '@angular/core';
import { DomElementMeasurerService, NumericFormatter, selector } from '@hypertrace/common';
import { select, Selection } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
import {
  ErrorPercentageMetricAggregation,
  ErrorPercentageMetricValueCategory
} from '../../../../..//graphql/model/schema/specifications/error-percentage-aggregation-specification';
import {
  TopologyEdgePositionInformation,
  TopologyEdgeRenderDelegate
} from '../../../../../components/topology/renderers/edge/topology-edge-renderer.service';
import {
  TopologyCoordinates,
  TopologyEdge,
  TopologyEdgeState,
  TopologyElementVisibility
} from '../../../../../components/topology/topology';
import { D3UtilService } from '../../../../../components/utils/d3/d3-util.service';
import { SvgUtilService } from '../../../../../components/utils/svg/svg-util.service';
import { MetricAggregationSpecification } from '../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { PercentileLatencyMetricAggregation } from '../../../../../graphql/model/schema/specifications/percentile-latency-aggregation-specification';
import { EntityEdge } from '../../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import {
  allErrorPercentageMetricCategories,
  allLatencyMetricCategories,
  getErrorPercentageCategoryClass,
  getErrorPercentageMetric,
  getLatencyCategoryClass,
  getLatencyMetric
} from '../../metric/metric-category';
import { VisibilityUpdater } from '../../visibility-updater';

@Injectable({ providedIn: 'root' })
export class EntityEdgeCurveRendererService implements TopologyEdgeRenderDelegate<EntityEdge> {
  private readonly edgeClass: string = 'entity-edge';
  private readonly edgeLineClass: string = 'entity-edge-line';
  private readonly edgeArrowClass: string = 'entity-edge-arrow';
  private readonly edgeMetricBubbleClass: string = 'entity-edge-metric-bubble';
  private readonly edgeMetricValueClass: string = 'entity-edge-metric-value';
  private readonly numberFormatter: NumericFormatter = new NumericFormatter();
  private readonly visibilityUpdater: VisibilityUpdater = new VisibilityUpdater();

  public constructor(
    private readonly domElementMeasurerService: DomElementMeasurerService,
    private readonly svgUtils: SvgUtilService,
    private readonly d3Utils: D3UtilService
  ) {}

  public matches(edge: TopologyEdge & Partial<EntityEdge>): edge is EntityEdge {
    return typeof edge.specification === 'object' && typeof edge.data === 'object';
  }

  public draw(
    element: SVGGElement,
    edge: EntityEdge,
    position: TopologyEdgePositionInformation,
    state: TopologyEdgeState<MetricAggregationSpecification>,
    domRenderer: Renderer2
  ): void {
    this.defineArrowMarkersIfNeeded(element, domRenderer);
    this.d3Utils
      .select(element, domRenderer)
      .classed(this.edgeClass, true)
      .attr('data-sensitive-pii', true)
      .call(selection => this.drawLine(selection))
      .call(selection => this.drawMetricBubble(selection))
      .call(selection => this.drawMetricText(selection));

    this.updateState(element, edge, state, domRenderer);
    this.updatePosition(element, edge, position, domRenderer);
  }

  public updatePosition(
    element: SVGGElement,
    _: EntityEdge,
    position: TopologyEdgePositionInformation,
    domRenderer: Renderer2
  ): void {
    const edgeSelection = this.d3Utils.select(element, domRenderer);
    this.updateLinePosition(edgeSelection, position);
    this.updateLabelPosition(edgeSelection, position);
    this.updateLabelBubblePosition(edgeSelection);
  }

  public updateState(
    element: SVGGElement,
    edge: EntityEdge,
    state: TopologyEdgeState<MetricAggregationSpecification>,
    domRenderer: Renderer2
  ): void {
    const selection = this.d3Utils.select(element, domRenderer);
    const metricSpecifications = state.dataSpecifiers?.map(specifier => specifier.value);

    this.updateEdgeMetric(
      selection,
      state.visibility,
      getLatencyMetric(edge.data, metricSpecifications),
      getErrorPercentageMetric(edge.data, metricSpecifications)
    );
    this.visibilityUpdater.updateVisibility(selection, state.visibility);

    // State can change the text of the label, which effects the bubble position
    this.updateLabelBubblePosition(selection);
  }

  protected updateEdgeMetric(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    visibility: TopologyElementVisibility,
    latencyMetric?: PercentileLatencyMetricAggregation,
    errorPercentageMetric?: ErrorPercentageMetricAggregation
  ): void {
    const edgeCategoryClass = this.getEdgeCategoryClass(latencyMetric, errorPercentageMetric);
    selection.classed(this.getAllCategoryClasses().join(' '), false).classed(edgeCategoryClass, true);

    selection
      .select(selector(this.edgeMetricValueClass))
      .text(this.getMetricValueString(latencyMetric, errorPercentageMetric));

    selection
      .select(selector(this.edgeLineClass))
      .attr(
        'marker-end',
        visibility === TopologyElementVisibility.Emphasized || visibility === TopologyElementVisibility.Focused
          ? `url(#${this.getMarkerIdForCategory(edgeCategoryClass)})`
          : 'none'
      );
  }

  private generateLineCenterPoint(position: TopologyEdgePositionInformation): TopologyCoordinates {
    return {
      x: (position.source.x + position.target.x) / 2,
      y: (position.source.y + position.target.y) / 2
    };
  }

  private getMarkerIdForCategory(category: string): string {
    return `${this.edgeArrowClass}-${category}`;
  }

  private drawLine(selection: Selection<SVGGElement, unknown, null, undefined>): void {
    selection.append('g').classed(this.edgeLineClass, true);
  }

  private defineArrowMarkersIfNeeded(edgeElement: SVGGElement, domRenderer: Renderer2): void {
    this.d3Utils
      .select(this.svgUtils.addDefinitionDeclarationToSvgIfNotExists(edgeElement, domRenderer), domRenderer)
      .selectAll('marker')
      .data(this.getAllCategoryClasses())
      .enter()
      .append('marker')
      .attr('id', category => this.getMarkerIdForCategory(category))
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .classed(this.edgeArrowClass, true)
      .each((category, index, elements) => this.d3Utils.select(elements[index], domRenderer).classed(category, true))
      .attr('d', 'M2,2 L5,5 L2,8');
  }

  private drawMetricBubble(selection: Selection<SVGGElement, unknown, null, undefined>): void {
    selection.append('rect').attr('rx', 8).attr('height', 16).classed(this.edgeMetricBubbleClass, true);
  }

  private drawMetricText(selection: Selection<SVGGElement, unknown, null, undefined>): void {
    selection.append('text').classed(this.edgeMetricValueClass, true).attr('dominant-baseline', 'middle');
  }

  private updateLinePosition(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    position: TopologyEdgePositionInformation
  ): void {
    const pathSelections = select(selection.node())
      .select(selector(this.edgeLineClass))
      .selectAll<SVGPathElement, TopologyEdgePositionInformation>('path')
      .data([position]);

    pathSelections.exit().remove();

    pathSelections
      .enter()
      .append('path')
      .merge(pathSelections)
      .attr('d', data =>
        linkHorizontal<TopologyEdgePositionInformation, Position>()
          .x(datum => datum.x)
          .y(datum => datum.y)(data)
      )
      .classed('edge-path', true);
  }

  private updateLabelPosition(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    position: TopologyEdgePositionInformation
  ): void {
    const lineCenter = this.generateLineCenterPoint(position);

    selection.select(selector(this.edgeMetricValueClass)).attr('x', lineCenter.x).attr('y', lineCenter.y);
  }

  private updateLabelBubblePosition(selection: Selection<SVGGElement, unknown, null, undefined>): void {
    const metricLabelBox = this.getTextBBox(selection);

    selection
      .select(selector(this.edgeMetricBubbleClass))
      .attr('x', metricLabelBox.x - this.getTextBubbleHorizontalPadding())
      .attr('y', metricLabelBox.y - this.getTextBubbleVerticalPadding())
      .attr('width', metricLabelBox.width + 2 * this.getTextBubbleHorizontalPadding())
      .attr('height', metricLabelBox.height + 2 * this.getTextBubbleVerticalPadding());
  }

  private getTextBBox(selection: Selection<SVGGElement, unknown, null, undefined>): DOMRect {
    return this.domElementMeasurerService.measureSvgElement(
      selection.select<SVGTextElement>(selector(this.edgeMetricValueClass)).node()!
    );
  }

  private getTextBubbleHorizontalPadding(): number {
    return 8;
  }

  private getTextBubbleVerticalPadding(): number {
    return 2;
  }

  protected getAllCategoryClasses(): string[] {
    return [
      ...allLatencyMetricCategories.map(getLatencyCategoryClass),
      ...allErrorPercentageMetricCategories.map(getErrorPercentageCategoryClass)
    ];
  }

  private getEdgeCategoryClass(
    latencyMetric?: PercentileLatencyMetricAggregation,
    errorPercentageMetric?: ErrorPercentageMetricAggregation
  ): string {
    if (errorPercentageMetric?.category === ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5) {
      return getErrorPercentageCategoryClass(errorPercentageMetric?.category);
    }

    if (latencyMetric) {
      return getLatencyCategoryClass(latencyMetric.category);
    }

    return '';
  }

  private getMetricValueString(
    latencyMetric?: PercentileLatencyMetricAggregation,
    errorPercentageMetric?: ErrorPercentageMetricAggregation
  ): string {
    if (
      errorPercentageMetric &&
      (errorPercentageMetric.category === ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5 || !latencyMetric)
    ) {
      return this.formattedMetricValue(errorPercentageMetric.value, errorPercentageMetric.units);
    }

    if (latencyMetric) {
      return this.formattedMetricValue(latencyMetric.value, latencyMetric.units);
    }

    return '-';
  }

  private formattedMetricValue(valueToShow: number, unit?: string): string {
    return `${this.numberFormatter.format(valueToShow)}${unit ?? ''}`;
  }
}

interface Position {
  x: number;
  y: number;
}
