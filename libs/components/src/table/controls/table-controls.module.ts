import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
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
    TraceCheckboxModule,
    SelectModule,
    MultiSelectModule
  ],
  declarations: [TableControlsComponent],
  exports: [TableControlsComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class TableControlsModule {}
