import { Injectable, Renderer2 } from '@angular/core';
import { Color, DomElementMeasurerService, NumericFormatter, selector } from '@hypertrace/common';
import { select, Selection } from 'd3-selection';
import { Link, linkHorizontal } from 'd3-shape';
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
import { MetricAggregation } from '../../../../../graphql/model/metrics/metric-aggregation';
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
  private readonly lineGenerator: Link<unknown, TopologyEdgePositionInformation, Position> = linkHorizontal<
    TopologyEdgePositionInformation,
    Position
  >()
    .x(datum => datum.x)
    .y(datum => datum.y);

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
    _position: TopologyEdgePositionInformation,
    _state: TopologyEdgeState<MetricAggregationSpecification>,
    domRenderer: Renderer2
  ): void {
    const edgeSelection = select(element);
    this.defineArrowMarkersIfNeeded(element, domRenderer);
    edgeSelection
      .classed(this.edgeClass, true)
      .attr('data-sensitive-pii', true)
      .call(selection => this.drawLine(selection))
      .call(selection => this.drawMetricBubble(selection))
      .call(selection => this.drawMetricText(selection, edge));
  }

  public updatePosition(
    element: SVGGElement,
    edge: EntityEdge,
    position: TopologyEdgePositionInformation,
    domRenderer: Renderer2
  ): void {
    const edgeSelection = this.d3Utils.select(element, domRenderer);
    this.updateLinePosition(edgeSelection, position);
    this.updateLabelPosition(edgeSelection, position);
    this.updateLabelBubblePosition(edgeSelection, position, edge);
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
    // this.updateLabelBubblePosition(selection);
  }

  protected updateEdgeMetric(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    visibility: TopologyElementVisibility,
    primaryMetricCategory?: TopologyMetricCategoryData,
    secondaryMetricCategory?: TopologyMetricCategoryData,
    _primaryMetricAggregation?: MetricAggregation,
    _secondaryMetricAggregation?: MetricAggregation
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
    const lineSelection = selection.append('g').classed(this.edgeLineClass, true);
    lineSelection.append('path').classed('edge-path', true);
  }

  public defineArrowMarkersIfNeeded(edgeElement: SVGGElement, domRenderer: Renderer2): void {
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
    // const text = this.getMetricTextForEdge(edge);

    // const width = textElem.textLength.baseVal.valueInSpecifiedUnits ?? 0;
    // const height = this.getTextHeight();
    // const x = Number(textElem.getAttribute('x') ?? 0) - (width / 2);
    // const y = Number(textElem.getAttribute('y') ?? 0) - this.getBubbleYOffset();

    selection.append('rect').attr('rx', 8).classed(this.edgeMetricBubbleClass, true);
    // .attr('x', x - this.getTextBubbleHorizontalPadding())
    //   .attr('y', y - this.getTextBubbleVerticalPadding())
    //   .attr('width', width + 2 * this.getTextBubbleHorizontalPadding())
    //   .attr('height', height + 2 * this.getTextBubbleVerticalPadding());
  }

  private drawMetricText(selection: Selection<SVGGElement, unknown, null, undefined>, edge: EntityEdge): void {
    const text = this.getMetricTextForEdge(edge);

    selection.append('text').classed(this.edgeMetricValueClass, true).attr('dominant-baseline', 'middle').text(text);
  }

  private getMetricTextForEdge(edge: EntityEdge): string {
    const primaryMetric = this.topologyDataSourceModelPropertiesService.getPrimaryEdgeMetric();
    const secondaryMetric = this.topologyDataSourceModelPropertiesService.getSecondaryEdgeMetric();

    const primaryMetricCategory = primaryMetric?.extractAndGetDataCategoryForMetric(edge.data);
    const secondaryMetricCategory = secondaryMetric?.extractAndGetDataCategoryForMetric(edge.data);
    const primaryMetricAggregation = primaryMetric?.extractDataForMetric(edge.data);
    const secondaryMetricAggregation = secondaryMetric?.extractDataForMetric(edge.data);

    return this.getMetricValueString(
      primaryMetricAggregation,
      secondaryMetricAggregation,
      primaryMetricCategory,
      secondaryMetricCategory
    );
  }

  private updateLinePosition(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    position: TopologyEdgePositionInformation
  ): void {
    selection
      .select(`g.${this.edgeLineClass}`)
      .select('path')
      .attr('d', () => this.lineGenerator(position));
  }

  public updateLabelPosition(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    position: TopologyEdgePositionInformation
  ): void {
    const lineCenter = this.generateLineCenterPoint(position);

    selection.select(selector(this.edgeMetricValueClass)).attr('x', lineCenter.x).attr('y', lineCenter.y);
  }

  public updateLabelBubblePosition(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    position: TopologyEdgePositionInformation,
    edge: EntityEdge
  ): void {
    const textLen = this.getMetricTextForEdge(edge).length;
    const lineCenter = this.generateLineCenterPoint(position);

    const textWidth = textLen * this.getCharWidth();
    const textHeight = this.getTextHeight();

    const width = textWidth + 2 * this.getTextBubbleHorizontalPadding();
    const height = textHeight + 2 * this.getTextBubbleVerticalPadding();
    const x = lineCenter.x - textWidth / 2 - this.getTextBubbleHorizontalPadding();
    const y = lineCenter.y - textHeight / 2 - this.getTextBubbleVerticalPadding();

    selection
      .select(selector(this.edgeMetricBubbleClass))
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);
  }

  public getTextBBox(selection: Selection<SVGGElement, unknown, null, undefined>): DOMRect {
    return this.domElementMeasurerService.measureSvgElement(
      selection.select<SVGTextElement>(selector(this.edgeMetricValueClass)).node()!
    );
  }

  public getTextBubbleHorizontalPadding(): number {
    return 6;
  }

  public getTextBubbleVerticalPadding(): number {
    return 2;
  }

  public getTextHeight(): number {
    return 14;
  }

  public getBubbleYOffset(): number {
    return 8;
  }

  private getCharWidth(): number {
    return 6;
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

  public getMetricValueString(
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
