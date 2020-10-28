import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { TraceSearchBoxModule } from '../../search-box/search-box.module';
import { ToggleGroupModule } from '../../toggle-group/toggle-group.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableControlsComponent } from './table-controls.component';

@NgModule({
  imports: [CommonModule, TooltipModule, TraceSearchBoxModule, ToggleGroupModule],
  providers: [SubscriptionLifecycle],
  declarations: [TableControlsComponent],
  exports: [TableControlsComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class TableControlsModule {}
