import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { GaugeListComponent } from './gauge-list.component';

@NgModule({
  declarations: [GaugeListComponent],
  imports: [CommonModule, TooltipModule, FormattingModule],
  exports: [GaugeListComponent]
})
export class GaugeListModule {}
