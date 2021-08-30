import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule, MemoizeModule } from '@hypertrace/common';
import { IconModule, ListViewModule, TableModule, TooltipModule } from '@hypertrace/components';
import { LogEventsTableComponent } from './log-events-table.component';
@NgModule({
  imports: [CommonModule, TableModule, IconModule, TooltipModule, FormattingModule, ListViewModule, MemoizeModule],
  declarations: [LogEventsTableComponent],
  exports: [LogEventsTableComponent]
})
export class LogEventsTableModule {}
