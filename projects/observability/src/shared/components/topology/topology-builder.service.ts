import { Injectable, Injector } from '@angular/core';
import { defaults } from 'lodash';
import { D3Topology } from './d3/d3-topology';
import { Topology, TopologyConfiguration } from './topology';

@Injectable({ providedIn: 'root' })
export class TopologyBuilderService {
  private static readonly DEFAULT_CONFIG: DefaultTopologyConfig = {
    zoomable: true,
    draggableNodes: true,
    hoverableNodes: true,
    hoverableEdges: true,
    clickableNodes: true,
    clickableEdges: true,
    nodeDataSpecifiers: [],
    edgeDataSpecifiers: []
  };

  public build(hostEl: Element, injector: Injector, config: RequiredTopologyConfig): Topology {
    return new D3Topology(hostEl, injector, this.getDefaultedConfig(config));
  }

  private getDefaultedConfig(partial: RequiredTopologyConfig): TopologyConfiguration {
    return defaults({}, partial, TopologyBuilderService.DEFAULT_CONFIG);
  }
}

type RequiredTopologyConfigKeys = 'nodeRenderer' | 'edgeRenderer' | 'nodes';
type RequiredTopologyConfig = Partial<TopologyConfiguration> & Pick<TopologyConfiguration, RequiredTopologyConfigKeys>;

type DefaultTopologyConfig = Omit<TopologyConfiguration, RequiredTopologyConfigKeys>;
