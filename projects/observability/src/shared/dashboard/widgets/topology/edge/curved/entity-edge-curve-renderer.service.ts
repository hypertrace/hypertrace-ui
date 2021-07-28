import { Injectable, Renderer2 } from '@angular/core';
import { Color, DomElementMeasurerService, NumericFormatter, selector } from '@hypertrace/common';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { select, Selection } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
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
import { EntityEdge } from '../../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { TopologyMetricCategoryData } from '../../../../data/graphql/topology/metrics/topology-metric-category.model';
import { TopologyDataSourceModelPropertiesService } from '../../topology-data-source-model-properties.service';
import { VisibilityUpdater } from '../../visibility-updater';

@Injectable()
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
    private readonly d3Utils: D3UtilService,
    private readonly topologyDataSourceModelPropertiesService: TopologyDataSourceModelPropertiesService
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

    const primaryMetric = this.topologyDataSourceModelPropertiesService.getPrimaryEdgeMetric();
    const secondaryMetric = this.topologyDataSourceModelPropertiesService.getSecondaryEdgeMetric();

    this.updateEdgeMetric(
      selection,
      state.visibility,
      primaryMetric?.extractAndGetDataCategoryForMetric(edge.data),
      secondaryMetric?.extractAndGetDataCategoryForMetric(edge.data),
      primaryMetric?.extractDataForMetric(edge.data),
      secondaryMetric?.extractDataForMetric(edge.data)
    );
    this.visibilityUpdater.updateVisibility(selection, state.visibility);

    // State can change the text of the label, which effects the bubble position
    this.updateLabelBubblePosition(selection);
  }

  protected updateEdgeMetric(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    visibility: TopologyElementVisibility,
    primaryMetricCategory?: TopologyMetricCategoryData,
    secondaryMetricCategory?: TopologyMetricCategoryData,
    primaryMetricAggregation?: MetricAggregation,
    secondaryMetricAggregation?: MetricAggregation
  ): void {
    const edgeFocusedCategory = this.isEmphasizedOrFocused(visibility)
      ? this.getEdgeFocusedCategory(primaryMetricCategory, secondaryMetricCategory)
      : undefined;

    selection
      .select(selector(this.edgeLineClass))
      .select('.edge-path')
      .attr('stroke', edgeFocusedCategory?.strokeColor ?? Color.Gray2);

    selection
      .select(selector(this.edgeMetricBubbleClass))
      .attr('fill', edgeFocusedCategory?.fillColor ?? '')
      .attr('stroke', edgeFocusedCategory?.strokeColor ?? 'none');

    selection
      .select(selector(this.edgeMetricValueClass))
      .text(
        this.getMetricValueString(
          primaryMetricAggregation,
          secondaryMetricAggregation,
          primaryMetricCategory,
          secondaryMetricCategory
        )
      );

    selection
      .select(selector(this.edgeLineClass))
      .attr(
        'marker-end',
        this.isEmphasizedOrFocused(visibility)
          ? `url(#${this.getMarkerIdForCategory(edgeFocusedCategory?.getCategoryClassName() ?? '')})`
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
    const allEdgeCategories = this.topologyDataSourceModelPropertiesService.getAllEdgeCategories();
    this.d3Utils
      .select(this.svgUtils.addDefinitionDeclarationToSvgIfNotExists(edgeElement, domRenderer), domRenderer)
      .selectAll('marker')
      .data(allEdgeCategories)
      .enter()
      .append('marker')
      .attr('id', category => this.getMarkerIdForCategory(category.getCategoryClassName()))
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto-start-reverse')
      .attr('fill', category => category.fillColor)
      .append('path')
      .classed(this.edgeArrowClass, true)
      .each((category, index, elements) =>
        this.d3Utils.select(elements[index], domRenderer).classed(category.getCategoryClassName(), true)
      )
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

  private isEmphasizedOrFocused(visibility: TopologyElementVisibility): boolean {
    return visibility === TopologyElementVisibility.Emphasized || visibility === TopologyElementVisibility.Focused;
  }

  private getEdgeFocusedCategory(
    primaryMetricCategory?: TopologyMetricCategoryData,
    secondaryMetricCategory?: TopologyMetricCategoryData
  ): TopologyMetricCategoryData | undefined {
    return secondaryMetricCategory?.highestPrecedence ? secondaryMetricCategory : primaryMetricCategory;
  }

  private getMetricValueString(
    primaryMetricAggregation?: MetricAggregation,
    secondaryMetricAggregation?: MetricAggregation,
    primaryMetricCategory?: TopologyMetricCategoryData,
    secondaryMetricCategory?: TopologyMetricCategoryData
  ): string {
    if (secondaryMetricAggregation && (secondaryMetricCategory?.highestPrecedence === true || !primaryMetricCategory)) {
      return this.formattedMetricValue(secondaryMetricAggregation.value, secondaryMetricAggregation?.units);
    }

    return primaryMetricAggregation
      ? this.formattedMetricValue(primaryMetricAggregation.value, primaryMetricAggregation?.units)
      : '-';
  }

  private formattedMetricValue(valueToShow: number, unit?: string): string {
    return `${this.numberFormatter.format(valueToShow)}${unit ?? ''}`;
  }
}

interface Position {
  x: number;
  y: number;
}
