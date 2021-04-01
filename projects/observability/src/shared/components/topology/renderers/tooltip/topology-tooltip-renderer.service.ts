import { Injectable, Injector, Type } from '@angular/core';
import { PopoverService } from '@hypertrace/components';
import { EMPTY } from 'rxjs';
import {
  TopologyEdge,
  TopologyNode,
  TopologyTooltip,
  TopologyTooltipOptions,
  TopologyTooltipRenderer
} from '../../topology';
import { TopologyTooltipPopover } from './topology-tooltip-popover';

@Injectable()
export class TopologyTooltipRendererService implements TopologyTooltipRenderer {
  private tooltipDefinition?: TooltipDefinition;
  public constructor(private readonly popoverService: PopoverService, private readonly injector: Injector) {}

  public useTooltip(tooltipDefinition: TooltipDefinition): this {
    this.tooltipDefinition = tooltipDefinition;

    return this;
  }

  public build(): TopologyTooltip {
    if (this.tooltipDefinition) {
      return new TopologyTooltipPopover(this.tooltipDefinition, this.injector, this.popoverService);
    }

    return this.getDefaultNoopTooltip();
  }

  private getDefaultNoopTooltip(): TopologyTooltip {
    return {
      showWithNodeData: () => {
        /*NOOP*/
      },
      showWithEdgeData: () => {
        /*NOOP*/
      },
      hide: () => {
        /*NOOP*/
      },
      destroy: () => {
        /*NOOP*/
      },
      hidden$: EMPTY
    };
  }
}

export interface TooltipDefinition {
  class: Type<unknown>;
}

export type TopologyTooltipData = TopologyTooltipNodeData | TopologyTooltipEdgeData;

interface TopologyTooltipDataBase {
  type: 'node' | 'edge';
  options: TopologyTooltipOptions;
}
export interface TopologyTooltipNodeData extends TopologyTooltipDataBase {
  type: 'node';
  node: TopologyNode;
}

export interface TopologyTooltipEdgeData extends TopologyTooltipDataBase {
  type: 'edge';
  edge: TopologyEdge;
}
