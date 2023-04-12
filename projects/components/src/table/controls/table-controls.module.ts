import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxModule } from '../../checkbox/checkbox.module';
import { FeatureConfigCheckModule } from '../../feature-check/feature-config-check.module';
import { MultiSelectModule } from '../../multi-select/multi-select.module';
import { TraceSearchBoxModule } from '../../search-box/search-box.module';
import { SelectModule } from '../../select/select.module';
import { ToggleGroupModule } from '../../toggle-group/toggle-group.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableControlsComponent } from './table-controls.component';

@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    TraceSearchBoxModule,
    ToggleGroupModule,
    CheckboxModule,
    SelectModule,
    MultiSelectModule,
    FeatureConfigCheckModule
  ],
  declarations: [TableControlsComponent],
  exports: [TableControlsComponent]
})
export class TableControlsModule {}
