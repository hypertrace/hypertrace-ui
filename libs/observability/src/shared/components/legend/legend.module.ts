import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from '@hypertrace/components';
import { LegendComponent } from './legend.component';

@NgModule({
  declarations: [LegendComponent],
  imports: [CommonModule, TooltipModule],
  exports: [LegendComponent]
})
export class LegendModule {}
