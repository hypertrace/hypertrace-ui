// tslint:disable: max-file-line-count
import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import {
  RenderableTopology,
  RenderableTopologyEdge,
  RenderableTopologyNode,
  TopologyCoordinates,
  TopologyEdge,
  TopologyElementVisibility,
  TopologyNode
} from '../../topology';
import { TreeLayout } from './tree-layout';

describe('Tree Layout', () => {
  let treeLayout: TreeLayout;
  let domElementRenderer: Renderer2;

  const buildTopologyNode = (): RenderableTopologyNode => ({
    x: 0,
    y: 0,
    incoming: [],
    outgoing: [],
    state: {
      visibility: TopologyElementVisibility.Normal,
      dragging: true
    },
    userNode: {
      edges: []
    },
    domElementRenderer: domElementRenderer,
    renderedData: () => ({
      getAttachmentPoint: (_angleRad: number): TopologyCoordinates => ({ x: 0, y: 0 }),
      getBoudingBox: () => ({ height: 10, width: 10, bottom: 0, left: 0, right: 0, top: 0 })
    })
  });

  const buildTopologyEdge = (
    source: RenderableTopologyNode,
    target: RenderableTopologyNode
  ): RenderableTopologyEdge => ({
    source: source,
    target: target,
    state: {
      visibility: TopologyElementVisibility.Normal
    },
    userEdge: {
      fromNode: source.userNode,
      toNode: target.userNode
    },
    domElementRenderer: domElementRenderer
  });

  const buildTopologyData = (): RenderableTopology<TopologyNode, TopologyEdge> => {
    const source = buildTopologyNode();
    const target = buildTopologyNode();

    const edge1 = buildTopologyEdge(source, target);
    source.outgoing.push(edge1);
    target.incoming.push(edge1);

    return {
      nodes: [source, target],
      edges: [edge1],
      neighborhood: {
        nodes: [],
        edges: []
      }
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [mockProvider(Renderer2)]
    });

    domElementRenderer = TestBed.inject(Renderer2);
    treeLayout = new TreeLayout();
  });

  test('assigns x and y positions for tree layout', () => {
    const topology = buildTopologyData();
    treeLayout.layout(topology);

    expect(topology.nodes[0].x).toEqual(0);
    expect(topology.nodes[0].y).toEqual(0);
    expect(topology.nodes[1].x).toEqual(170);
    expect(topology.nodes[1].y).toEqual(0);
  });
});
