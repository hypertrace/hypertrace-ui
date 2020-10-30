import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TraceSearchBoxModule } from '../../search-box/search-box.module';
import { ToggleGroupModule } from '../../toggle-group/toggle-group.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableControlsComponent } from './table-controls.component';

@NgModule({
  imports: [CommonModule, TooltipModule, TraceSearchBoxModule, ToggleGroupModule],
  declarations: [TableControlsComponent],
  exports: [TableControlsComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class TableControlsModule {}
