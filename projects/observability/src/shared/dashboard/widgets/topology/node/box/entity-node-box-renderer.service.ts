import { Injectable, Renderer2 } from '@angular/core';
import { Color, DomElementMeasurerService, NumericFormatter, selector } from '@hypertrace/common';
import { select, Selection } from 'd3-selection';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TopologyNodeRendererDelegate } from '../../../../../components/topology/renderers/node/topology-node-renderer.service';
import {
  TopologyCoordinates,
  TopologyElementVisibility,
  TopologyNode,
  TopologyNodeState
} from '../../../../../components/topology/topology';
import { D3UtilService } from '../../../../../components/utils/d3/d3-util.service';
import { SvgUtilService } from '../../../../../components/utils/svg/svg-util.service';
import { MetricAggregation } from '../../../../../graphql/model/metrics/metric-aggregation';
import { MetricHealth } from '../../../../../graphql/model/metrics/metric-health';
import { Entity } from '../../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { EntityNode } from '../../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { EntityIconLookupService } from '../../../../../services/entity/entity-icon-lookup.service';
import { EntityNavigationService } from '../../../../../services/navigation/entity/entity-navigation.service';
import { TopologyMetricCategoryData } from '../../../../data/graphql/topology/metrics/topology-metric-category.model';
import { TopologyDataSourceModelPropertiesService } from '../../topology-data-source-model-properties.service';
import { VisibilityUpdater } from '../../visibility-updater';

@Injectable() // Annotate so parameters still provide metadata for children
export abstract class EntityNodeBoxRendererService implements TopologyNodeRendererDelegate<EntityNode> {
  private readonly entityMetricClass: string = 'entity-metric-value';
  private readonly entityOuterBandClass: string = 'entity-outer-band';
  private readonly metricCategoryClass: string = 'metric-category';
  private readonly dropshadowFilterId: string = 'entity-node-dropshadow-filter';
  private readonly nodeSelectionMap: WeakMap<
    EntityNode,
    Selection<SVGGElement, unknown, null, undefined>
  > = new WeakMap();
  private readonly numberFormatter: NumericFormatter = new NumericFormatter();
  private readonly visibilityUpdater: VisibilityUpdater = new VisibilityUpdater();
  private readonly destroyed$: Subject<EntityNode> = new Subject();

  public constructor(
    private readonly entityNavigationService: EntityNavigationService,
    private readonly domElementMeasurerService: DomElementMeasurerService,
    private readonly svgUtils: SvgUtilService,
    protected readonly d3Utils: D3UtilService,
    private readonly entityIconLookupService: EntityIconLookupService,
    private readonly topologyDataSourceModelPropertiesService: TopologyDataSourceModelPropertiesService
  ) {}

  public abstract matches(node: TopologyNode & Partial<EntityNode>): node is EntityNode;

  public draw(
    nodeElement: SVGGElement,
    node: EntityNode,
    state: TopologyNodeState<MetricAggregationSpecification>,
    domElementRenderer: Renderer2
  ): void {
    this.defineDropshadowFilterIfNotExists(nodeElement, domElementRenderer);
    const nodeSelection = this.d3Utils
      .select(nodeElement, domElementRenderer)
      .classed('entity-node', true)
      .attr('data-sensitive-pii', true)
      .classed(this.getNodeClasses(node).join(' '), true);

    this.nodeSelectionMap.set(node, nodeSelection);

    this.appendNodeFeatures(nodeSelection, node, domElementRenderer);
    this.updateState(nodeElement, node, state, domElementRenderer);
  }

  public height(): number {
    return this.boxHeight() + this.getPadding();
  }

  public width(): number {
    return this.boxWidth() + this.getPadding();
  }

  public getAttachmentPoint(angle: number): TopologyCoordinates {
    if (this.isAnglePerpendicularlyAbove(angle)) {
      return {
        x: this.boxWidth() / 2,
        y: 0
      };
    }

    if (this.isAnglePerpendicularlyBelow(angle)) {
      return {
        x: this.boxWidth() / 2,
        y: this.boxHeight()
      };
    }

    return {
      x: this.isAngleInIVQuadrant(angle) || this.isAngleInIQuadrant(angle) ? this.boxWidth() : 0,
      y: this.getCenterY()
    };
  }

  public updateState(
    element: SVGGElement,
    node: EntityNode,
    state: TopologyNodeState<MetricAggregationSpecification>,
    domElementRenderer: Renderer2
  ): void {
    const elementSelection = this.d3Utils.select(element, domElementRenderer);
    const primaryMetricCategory = this.topologyDataSourceModelPropertiesService
      .getPrimaryNodeMetric()
      ?.extractAndGetDataCategoryForMetric(node.data);
    const secondaryMetricCategory = this.topologyDataSourceModelPropertiesService
      .getSecondaryNodeMetric()
      ?.extractAndGetDataCategoryForMetric(node.data);

    this.updateNodeMetric(elementSelection, state.visibility, primaryMetricCategory, secondaryMetricCategory);
    this.visibilityUpdater.updateVisibility(elementSelection, state.visibility);

    elementSelection.classed('dragging', state.dragging);
  }

  public destroy(node: EntityNode): void {
    this.destroyed$.next(node);
  }

  protected abstract appendNodeFeatures(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: EntityNode,
    domElementRenderer: Renderer2
  ): void;

  protected abstract getNodeClasses(node: EntityNode): string[];

  protected updateNodeMetric(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    visibility: TopologyElementVisibility,
    primaryMetric?: TopologyMetricCategoryData,
    secondaryMetric?: TopologyMetricCategoryData
  ): void {
    selection
      .classed(primaryMetric?.getCategoryClassName() ?? '', true)
      .classed(secondaryMetric?.getCategoryClassName() ?? '', true)
      .select(selector(this.entityMetricClass));

    // For primary category
    selection.select(selector(this.metricCategoryClass)).attr('fill', primaryMetric?.fillColor!);

    // For secondary category
    selection
      .select(selector(this.entityOuterBandClass))
      .style('fill', () => {
        if (visibility === TopologyElementVisibility.Focused || visibility === TopologyElementVisibility.Emphasized) {
          return this.focusedOrEmphasizedColor();
        }

        return secondaryMetric?.fillColor ?? '';
      })
      .style('stroke', () => {
        if (visibility === TopologyElementVisibility.Focused) {
          return secondaryMetric?.highestPrecedence === true ? secondaryMetric?.focusColor : primaryMetric?.focusColor!;
        }

        return secondaryMetric?.strokeColor ?? '';
      });
  }

  protected isEntityNode(node: TopologyNode & Partial<EntityNode>): node is EntityNode {
    return typeof node.specification === 'object' && typeof node.data === 'object';
  }

  protected addEntityWithIcon(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: EntityNode,
    domElementRenderer: Renderer2
  ): void {
    const entity = node.data;
    this.buildIconForEntity(entity, domElementRenderer)
      .pipe(takeUntil(this.getNodeDestructionObservable(entity)))
      .subscribe(iconContent => this.addEntity(nodeSelection, node, this.entityStartX(), iconContent));
  }

  protected addOuterBand(nodeSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    nodeSelection
      .append('rect')
      .classed(this.entityOuterBandClass, true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.boxWidth())
      .attr('height', this.boxHeight())
      .attr('stroke-width', this.bandSize())
      .attr('rx', '8px')
      .attr('ry', '8px');
  }

  protected addMetricCategory(nodeSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    nodeSelection
      .append('circle')
      .classed(this.metricCategoryClass, true)
      .attr('transform', `translate(${this.getPadding()}, ${(this.boxHeight() - this.metricCategoryWidth()) / 2})`)
      .attr('cx', '4')
      .attr('cy', '4')
      .attr('r', '4');
  }

  private addEntity(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: EntityNode,
    startX: number,
    iconContent?: SVGElement
  ): void {
    const width = this.nodeLabelWidth(startX, iconContent !== undefined);
    nodeSelection
      .append('text')
      .classed('entity-label', true)
      .text(this.getLabelForNode(node))
      .attr('y', this.getCenterY() + 1)
      .each((_, index, groups) => {
        const currentElement = groups[index];
        this.svgUtils.truncateText(currentElement, width);
        select(currentElement).attr(
          'x',
          startX + this.domElementMeasurerService.getComputedTextLength(currentElement) / 2
        );
      })
      .attr('dominant-baseline', 'central')
      .on('click', () => this.entityNavigationService.navigateToEntity(node.data));

    if (iconContent) {
      this.appendEntityIcon(nodeSelection, this.entityIconStartX(), iconContent);
    }
  }

  private appendEntityIcon(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    startX: number,
    iconContent: SVGElement
  ): void {
    nodeSelection
      .append('g')
      .classed('node-icon', true)
      .append(() => iconContent)
      .attr('width', this.nodeIconWidth())
      .attr('height', this.nodeIconHeight())
      .attr('x', startX)
      .attr('y', this.getCenterY() - this.nodeIconHeight() / 2);
  }

  protected addHealthMetric(nodeSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    const healthSelection = nodeSelection
      .append('g')
      .classed('entity-health', true)
      .attr(
        'transform',
        `translate(${this.metricCategoryStartX()}, ${(this.boxHeight() - this.metricHealthHeight()) / 2})`
      );

    healthSelection
      .append('rect')
      .classed('entity-metric-health', true)
      .attr('height', this.metricHealthHeight())
      .attr('width', this.metricHealthWidth())
      .attr('stroke-width', this.bandSize())
      .attr('rx', '3px')
      .attr('ry', '3px');

    healthSelection
      .append('text')
      .classed(this.entityMetricClass, true)
      .text(this.getMetricString())
      .attr('y', this.metricHealthHeight() / 2)
      .attr('x', this.metricHealthWidth() / 2)
      .attr('dominant-baseline', 'central')
      .each((_datum, index, groups) => this.svgUtils.truncateText(groups[index], 30));
  }

  protected focusedOrEmphasizedColor(): string {
    return Color.White;
  }

  protected focusedBandColor(): string {
    return Color.Blue4;
  }

  protected boxWidth(): number {
    return 240;
  }

  protected boxHeight(): number {
    return 36;
  }

  protected metricCategoryWidth(): number {
    return 4;
  }

  protected metricCategoryHeight(): number {
    return 4;
  }

  protected metricHealthWidth(): number {
    return 44;
  }

  protected metricHealthHeight(): number {
    return 20;
  }

  protected nodeIconHeight(): number {
    return 12;
  }

  protected nodeIconWidth(): number {
    return 12;
  }

  protected nodeLabelWidth(startX: number, withIcon: boolean = false): number {
    if (withIcon) {
      return this.entityIconStartX() - startX - this.getInsideMargin();
    }

    return this.boxWidth() - startX - 2 * this.getPadding();
  }

  protected outerBandRadius(): number {
    return 36;
  }

  protected outerBandDiameter(): number {
    return this.outerBandRadius() * 2;
  }

  protected glyphRadius(): number {
    return 12;
  }

  protected glyphDiameter(): number {
    return 2 * this.glyphRadius();
  }

  protected bandSize(): number {
    return 1;
  }

  protected getCenterX(): number {
    return this.boxWidth() / 2;
  }

  protected getCenterY(): number {
    return this.boxHeight() / 2;
  }

  protected getPadding(): number {
    return 16;
  }

  protected getInsideMargin(): number {
    return 6;
  }

  protected metricCategoryStartX(): number {
    return this.getPadding();
  }

  private entityStartX(): number {
    return this.metricCategoryStartX() + this.metricCategoryWidth() + this.getInsideMargin();
  }

  protected entityIconStartX(): number {
    return this.boxWidth() - this.getPadding() - this.nodeIconWidth();
  }

  protected getHealthClass(health: MetricHealth): string {
    return `${health}-health`;
  }

  protected getHealthForNode(metricAggregation?: MetricAggregation): MetricHealth {
    return metricAggregation ? metricAggregation.health : MetricHealth.NotSpecified;
  }

  protected getMetricString(metricAggregation?: MetricAggregation): string {
    // TODO more thoughtful units
    return metricAggregation ? this.numberFormatter.format(metricAggregation.value) : '-';
  }

  protected getLabelForNode(entityNode: EntityNode): string {
    return entityNode.data[entityNode.specification.titleSpecification.resultAlias()] as string;
  }

  private defineDropshadowFilterIfNotExists(element: SVGGElement, domElementRenderer: Renderer2): void {
    this.svgUtils.addDropshadowFilterToParentSvgIfNotExists(
      element,
      this.dropshadowFilterId,
      domElementRenderer,
      'lightgray'
    );
  }

  private isAngleInIVQuadrant(angle: number): boolean {
    return angle > (3 * Math.PI) / 2 && angle <= 2 * Math.PI;
  }

  private isAngleInIQuadrant(angle: number): boolean {
    return angle >= 0 && angle < Math.PI / 2;
  }

  private isAnglePerpendicularlyAbove(angle: number): boolean {
    return angle === Math.PI / 2;
  }

  private isAnglePerpendicularlyBelow(angle: number): boolean {
    return angle === (3 * Math.PI) / 2;
  }

  private buildIconForEntity(entity: Entity, domElementRenderer: Renderer2): Observable<SVGElement> {
    const iconType = this.entityIconLookupService.forEntity(entity);

    return this.d3Utils.buildIcon(iconType, domElementRenderer);
  }

  private getNodeDestructionObservable(entity: Entity): Observable<EntityNode> {
    return this.destroyed$.pipe(filter(node => node.data === entity));
  }
}
