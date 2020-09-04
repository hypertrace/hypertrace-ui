import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { LabelComponent } from './label.component';

@NgModule({
  imports: [CommonModule, TooltipModule, LayoutChangeModule],
  declarations: [LabelComponent],
  exports: [LabelComponent]
})
export class LabelModule {}
