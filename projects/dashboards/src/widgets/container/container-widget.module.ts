import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ContainerWidgetRendererComponent } from './container-widget-renderer.component';
import { ContainerWidgetModel } from './container-widget.model';
import { AutoContainerLayoutModel } from './layout/auto/auto-container-layout.model';
import { ContainerLayoutComponent } from './layout/container-layout.component';
import { CellSpanModel } from './layout/custom/cell-span/cell-span.model';
import { CustomContainerLayoutModel } from './layout/custom/custom-container-layout.model';
import { AutoDimensionModel } from './layout/custom/dimension/auto-dimension.model';
import { DimensionModel } from './layout/custom/dimension/dimension.model';
import { MaxContentContainerLayoutModel } from './layout/max-content/max-content-container-layout.model';

@NgModule({
  declarations: [ContainerWidgetRendererComponent, ContainerLayoutComponent],
  imports: [
    CommonModule,
    DashboardCoreModule.with({
      models: [
        ContainerWidgetModel,
        AutoContainerLayoutModel,
        CustomContainerLayoutModel,
        CellSpanModel,
        DimensionModel,
        AutoDimensionModel,
        MaxContentContainerLayoutModel
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
