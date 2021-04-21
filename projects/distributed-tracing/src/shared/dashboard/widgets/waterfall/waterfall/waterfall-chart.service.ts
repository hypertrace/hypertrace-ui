import { Injectable } from '@angular/core';
import { Color, ColorService } from '@hypertrace/common';
import { SequenceSegment } from '@hypertrace/components';
import { isNil, sortBy } from 'lodash-es';
import { of } from 'rxjs';
import { TracingIconLookupService } from '../../../../services/icon-lookup/tracing-icon-lookup.service';
import { WaterfallData, WaterfallDataNode } from './waterfall-chart';

@Injectable({
  providedIn: 'root'
})
export class WaterfallChartService {
  private static readonly SEQUENCE_COLORS: symbol = Symbol('Sequence colors');
  public constructor(
    private readonly colorService: ColorService,
    private readonly iconLookupService: TracingIconLookupService
  ) {
    this.colorService.registerColorPalette(WaterfallChartService.SEQUENCE_COLORS, [
      Color.Blue5,
      Color.Blue3,
      Color.Gray7,
      '#B7C0C2',
      Color.Orange5,
      Color.Orange3,
      Color.Purple5,
      Color.Purple3
    ]);
  }

  public buildSequenceMap(data: WaterfallData[]): Map<string, WaterfallDataNode> {
    const dataNodeMap: Map<string, WaterfallDataNode> = new Map();

    // Add all nodes
    data.forEach(datum => {
      const currentNode: WaterfallDataNode = {
        ...datum,
        $$state: {
          expanded: true,
          children: []
        },
        $$spanName: {
          name: datum.name,
          serviceName: datum.serviceName,
          protocolName: datum.protocolName,
          error: datum.errorCount > 0
        },
        $$iconType: this.iconLookupService.forSpanType(datum.spanType)!,
        getChildren: () => of([]),
        isExpandable: () => true
      };

      dataNodeMap.set(currentNode.id, currentNode);
    });

    // Set parent nodes, if any
    data.forEach(datum => {
      const currentNode: WaterfallDataNode = dataNodeMap.get(datum.id)!;

      if (!isNil(currentNode.parentId) && dataNodeMap.has(currentNode.parentId)) {
        const parentNode = dataNodeMap.get(currentNode.parentId)!;
        parentNode.$$state.children.push(currentNode);
        currentNode.$$state.parent = parentNode;
      }
    });

    dataNodeMap.forEach(node => {
      if (node.$$state.parent === undefined) {
        node.$$state.expanded = true;
      }

      node.getChildren = () => of(node.$$state.children);
      node.isExpandable = () => node.$$state.children.length > 0;
    });

    this.assignColors(dataNodeMap);

    return dataNodeMap;
  }

  public buildSegmentsData(dataNodeMap: Map<string, WaterfallDataNode>): SequenceSegment[] {
    const segments: SequenceSegment[] = [];
    const sequenceNodes = this.collectRootNodes(dataNodeMap);
    // Do DFS
    while (sequenceNodes.length !== 0) {
      const node = sequenceNodes.shift()!;
      if (node.$$state.expanded) {
        segments.push({
          id: node.id,
          start: node.startTime,
          end: node.endTime,
          label: node.name,
          color: node.color!
        });

        sequenceNodes.unshift(...node.$$state.children);
      }
    }

    return segments;
  }

  public collectRootNodes(dataNodeMap: Map<string, WaterfallDataNode>): WaterfallDataNode[] {
    const rootNodes = [] as WaterfallDataNode[];

    dataNodeMap.forEach(node => {
      if (!node.$$state.parent) {
        rootNodes.push(node);
      }
    });

    // Sort by Start time in asc order.
    return sortBy(rootNodes, rootNode => rootNode.startTime);
  }

  public assignColors(dataNodeMap: Map<string, WaterfallDataNode>): void {
    const originalColors = this.colorService.getColorPalette(WaterfallChartService.SEQUENCE_COLORS).forOriginalColors();
    const colorMap: Map<string, string> = new Map();
    const nodes = this.collectRootNodes(dataNodeMap);
    let uniqueServiceIndex = 0;

    // Do DFS
    while (nodes.length !== 0) {
      const node = nodes.shift()!;
      let color;

      if (node.$$spanName.error) {
        // If span contains an error
        color = Color.Red5;
      } else if (colorMap.has(node.serviceName)) {
        // ServiceName seen before. Use existing service color
        color = colorMap.get(node.serviceName)!;
      } else {
        // New serviceName. Assign a new color
        color = originalColors[uniqueServiceIndex % originalColors.length];
        colorMap.set(node.serviceName, color);
        uniqueServiceIndex++;
      }

      node.color = color;
      node.$$spanName.color = color;
      nodes.unshift(...node.$$state.children);
    }
  }
}
