import { Injectable, Renderer2 } from '@angular/core';
import { Selection } from 'd3-selection';
import { TopologyNodeRendererDelegate } from '../../../../../../components/topology/renderers/node/topology-node-renderer.service';
import {
  TopologyCoordinates,
  TopologyElementVisibility,
  TopologyGroupNode,
  TopologyNode,
  TopologyNodeState,
} from '../../../../../../components/topology/topology';
import { D3UtilService } from '../../../../../../components/utils/d3/d3-util.service';
import { Color } from '../../../../../../../../../common/src/public-api';
import { IconType } from '../../../../../../../../../assets-library/src/public-api';
import { take } from 'rxjs/operators';
import { SvgUtilService } from '../../../../../../components/utils/svg/svg-util.service';
import { TopologyGroupNodeUtil } from '../../../../../../components/topology/utils/topology-group-node.util';

@Injectable()
export class GroupNodeBoxRendererService implements TopologyNodeRendererDelegate<TopologyGroupNode> {
  private readonly groupNodeClass: string = 'group-node';
  private readonly backgroundRectClass: string = 'background-rect';
  private readonly dataRectClass: string = 'data-rect';
  private readonly dropShadowFilterId: string = 'group-node-drop-shadow-filter';

  public constructor(protected readonly d3Utils: D3UtilService, private readonly svgUtils: SvgUtilService) {}

  public matches(node: TopologyNode & Partial<TopologyGroupNode>): node is TopologyGroupNode {
    return TopologyGroupNodeUtil.isTopologyGroupNode(node);
  }

  public draw(
    nodeElement: SVGGElement,
    node: TopologyGroupNode,
    _state: TopologyNodeState,
    domElementRenderer: Renderer2,
  ): void {
    const nodeSelection = this.d3Utils
      .select(nodeElement, domElementRenderer)
      .classed(this.groupNodeClass, true)
      .style('cursor', 'pointer');

    this.drawBackgroundRect(nodeSelection, node);
    this.drawDataRect(nodeSelection);
    this.drawTotalCountText(nodeSelection, node);
    this.drawPrefixIcon(nodeSelection, domElementRenderer);
    this.drawSuffixIcon(nodeSelection, node, domElementRenderer);
    this.drawNodeTitle(nodeSelection, node);
    this.defineDropShadowFilterIfNotExists(nodeElement, domElementRenderer);
  }

  public height(): number {
    return this.boxHeight();
  }

  public width(): number {
    return this.boxWidth();
  }

  public getAttachmentPoint(angle: number): TopologyCoordinates {
    if (this.isAnglePerpendicularlyAbove(angle)) {
      return {
        x: this.boxWidth() / 2,
        y: 0,
      };
    }

    if (this.isAnglePerpendicularlyBelow(angle)) {
      return {
        x: this.boxWidth() / 2,
        y: this.boxHeight(),
      };
    }

    return {
      x: this.isAngleInIVQuadrant(angle) || this.isAngleInIQuadrant(angle) ? this.boxWidth() : 0,
      y: this.getCenterY(),
    };
  }

  public updateState(
    element: SVGGElement,
    _node: TopologyGroupNode,
    state: TopologyNodeState,
    domElementRenderer: Renderer2,
  ): void {
    const nodeSelection = this.d3Utils.select(element, domElementRenderer);

    if (
      state.dragging ||
      [TopologyElementVisibility.Emphasized, TopologyElementVisibility.Focused].includes(state.visibility)
    ) {
      nodeSelection.style('filter', `url(#${this.dropShadowFilterId})`);
    } else {
      nodeSelection.style('filter', '');
    }

    if (state.visibility === TopologyElementVisibility.Background) {
      nodeSelection.style('opacity', 0.5);
    } else {
      nodeSelection.style('opacity', 1);
    }
  }

  public destroy(_node: TopologyGroupNode): void {
    // TODO: Add Later
  }

  // ### Draw functions ###

  private drawBackgroundRect(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: TopologyGroupNode,
  ): void {
    if (!node.expanded) {
      nodeSelection
        .append('rect')
        .classed(this.backgroundRectClass, true)
        .attr('x', 3)
        .attr('y', 3)
        .attr('width', this.width())
        .attr('height', this.height())
        .attr('stroke-width', 1)
        .attr('rx', '8px')
        .attr('ry', '8px')
        .attr('fill', 'white')
        .attr('stroke', Color.Gray1);
    }
  }

  private drawDataRect(nodeSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    nodeSelection
      .append('rect')
      .classed(this.dataRectClass, true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width())
      .attr('height', this.height())
      .attr('rx', '8px')
      .attr('ry', '8px')
      .attr('fill', Color.Gray1);
  }

  private drawTotalCountText(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: TopologyGroupNode,
  ): void {
    nodeSelection
      .append('text')
      .text(node.children.length)
      .attr('fill', Color.Blue4)
      .attr('text-anchor', 'end')
      .attr('font-size', '14px')
      .attr('transform', `translate(${this.boxWidth() - 8}, -24)`)
      .attr('y', this.getCenterY() - 1);
  }

  private drawPrefixIcon(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    domElementRenderer: Renderer2,
  ): void {
    this.d3Utils
      .buildIcon(IconType.Folder, domElementRenderer)
      .pipe(take(1))
      .subscribe(iconContent =>
        nodeSelection
          .append('g')
          .classed('group-node-prefix-icon', true)
          .append(() => iconContent)
          .attr('width', this.nodeIconWidth())
          .attr('height', this.nodeIconHeight())
          .attr('x', this.boxPaddingLeft())
          .attr('y', this.getCenterY() - this.nodeIconHeight() / 2),
      );
  }

  private drawSuffixIcon(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: TopologyGroupNode,
    domElementRenderer: Renderer2,
  ): void {
    if (node.data.suffixIcon) {
      this.d3Utils
        .buildIcon(node.data.suffixIcon, domElementRenderer)
        .pipe(take(1))
        .subscribe(iconContent =>
          nodeSelection
            .append('g')
            .classed('group-node-suffix-icon', true)
            .append(() => iconContent)
            .attr('width', this.nodeIconWidth())
            .attr('height', this.nodeIconHeight())
            .attr('x', this.boxWidth() - this.boxPaddingRight() - this.nodeIconWidth())
            .attr('y', this.getCenterY() - this.nodeIconHeight() / 2),
        );
    }
  }

  private drawNodeTitle(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: TopologyGroupNode,
  ): void {
    const titleStartX = this.boxPaddingLeft() + this.titleOffsetLeft() + this.nodeIconWidth();
    const titleEndX =
      this.boxWidth() - titleStartX - this.titleOffsetRight() - this.nodeIconWidth() - this.boxPaddingRight();
    const titleWidth = titleEndX - titleStartX;
    const truncatedText = this.getTruncatedText(node.data.title, titleWidth);

    nodeSelection
      .append('text')
      .classed('group-node-title', true)
      .text(truncatedText)
      .attr('transform', `translate(${titleStartX} , 0)`)
      .attr('y', this.getCenterY() - 1)
      .attr('dominant-baseline', 'central');
  }

  private getTruncatedText(text: string, maxWidth: number): string {
    const textWidth = text.length * this.getCharWidth();

    if (textWidth <= maxWidth) {
      return text;
    }

    const eachSideTotalChars = Math.floor((maxWidth - 3 * this.getCharWidth()) / 2 / this.getCharWidth());

    return `${text.slice(0, eachSideTotalChars)}...${text.slice(text.length - eachSideTotalChars)}`;
  }

  private defineDropShadowFilterIfNotExists(element: SVGGElement, domElementRenderer: Renderer2): void {
    this.svgUtils.addDropshadowFilterToParentSvgIfNotExists(
      element,
      this.dropShadowFilterId,
      domElementRenderer,
      Color.Gray2,
    );
  }

  // ### Node Properties ###

  protected boxWidth(): number {
    return 240;
  }

  protected boxHeight(): number {
    return 36;
  }

  protected getCenterY(): number {
    return this.boxHeight() / 2;
  }

  private isAnglePerpendicularlyAbove(angle: number): boolean {
    return angle === Math.PI / 2;
  }

  private isAngleInIVQuadrant(angle: number): boolean {
    return angle > (3 * Math.PI) / 2 && angle <= 2 * Math.PI;
  }

  private isAngleInIQuadrant(angle: number): boolean {
    return angle >= 0 && angle < Math.PI / 2;
  }

  private isAnglePerpendicularlyBelow(angle: number): boolean {
    return angle === (3 * Math.PI) / 2;
  }

  private nodeIconWidth(): number {
    return 14;
  }

  private nodeIconHeight(): number {
    return 14;
  }

  private boxPaddingLeft(): number {
    return 12;
  }

  private boxPaddingRight(): number {
    return 12;
  }

  private titleOffsetLeft(): number {
    return 8;
  }

  private titleOffsetRight(): number {
    return 8;
  }

  // This is the average char width for the font sans-serif
  private getCharWidth(): number {
    return 6;
  }
}
