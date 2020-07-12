import { Injectable, Renderer2 } from '@angular/core';
import { Selection } from 'd3-selection';
import { TopologyNode } from '../../../../../../components/topology/topology';
import { entityTypeKey, ObservabilityEntityType } from '../../../../../../graphql/model/schema/entity';
import { EntityNode } from '../../../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { EntityNodeBoxRendererService } from '../entity-node-box-renderer.service';

@Injectable({ providedIn: 'root' })
export class BackendNodeBoxRendererService extends EntityNodeBoxRendererService {
  public matches(node: TopologyNode & Partial<EntityNode>): node is EntityNode {
    return this.isEntityNode(node) && node.data[entityTypeKey] === ObservabilityEntityType.Backend;
  }

  public appendNodeFeatures(
    nodeSelection: Selection<SVGGElement, unknown, null, undefined>,
    node: EntityNode,
    domElementRenderer: Renderer2
  ): void {
    this.addOuterBand(nodeSelection);
    this.addMetricCategory(nodeSelection);
    this.addEntityWithIcon(nodeSelection, node, domElementRenderer);
  }

  protected getNodeClasses(): string[] {
    return ['backend'];
  }

  protected getHealthClass(): string {
    return '';
  }
}
