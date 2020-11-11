import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ConditionalContainerWidgetModel } from './conditional-container-widget.model';
import { ContainerWidgetRendererComponent } from './container-widget-renderer.component';
import { ContainerWidgetModel } from './container-widget.model';
import { AutoContainerLayoutModel } from './layout/auto/auto-container-layout.model';
import { ContainerLayoutComponent } from './layout/container-layout.component';
import { CellSpanModel } from './layout/custom/cell-span/cell-span.model';
import { CustomContainerLayoutModel } from './layout/custom/custom-container-layout.model';
import { DimensionModel } from './layout/custom/dimension/dimension.model';

@NgModule({
  declarations: [ContainerWidgetRendererComponent, ContainerLayoutComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [
        ConditionalContainerWidgetModel,
        ContainerWidgetModel,
        AutoContainerLayoutModel,
        CustomContainerLayoutModel,
        CellSpanModel,
        DimensionModel
      ],
      renderers: [ContainerWidgetRendererComponent]
    }),
    FlexLayoutModule,
    TitledContentModule,
    LabelModule,
    FormattingModule
  ]
})
export class ContainerWidgetModule {}
