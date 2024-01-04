import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxModule, IconModule, LayoutChangeModule, PopoverModule, SelectModule } from '@hypertrace/components';
import { TopologyInteractionControlComponent } from './d3/interactions/topology-interaction-control.component';
import { TopologyComponent } from './topology.component';

@NgModule({
  declarations: [TopologyComponent, TopologyInteractionControlComponent],
  exports: [TopologyComponent],
  imports: [CommonModule, IconModule, CheckboxModule, PopoverModule, LayoutChangeModule, SelectModule],
})
export class TopologyModule {}
