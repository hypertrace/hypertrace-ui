import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule, LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TopologyModule } from '../../../components/topology/topology.module';
import { TopologyEntityTooltipComponent } from './tooltip/topology-entity-tooltip.component';
import { TopologyWidgetRendererComponent } from './topology-widget-renderer.component';
import { TopologyWidgetModel } from './topology-widget.model';

@NgModule({
  declarations: [TopologyWidgetRendererComponent, TopologyEntityTooltipComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TopologyWidgetModel],
      renderers: [TopologyWidgetRendererComponent]
    }),
    TopologyModule,
    CommonModule,
    FormattingModule,
    TitledContentModule,
    LoadAsyncModule,
    IconModule
  ]
})
export class TopologyWidgetModule {}
