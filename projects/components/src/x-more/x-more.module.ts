import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from '../tooltip/tooltip.module';
import { XMoreComponent } from './x-more.component';

@NgModule({
  imports: [CommonModule, TooltipModule],
  declarations: [XMoreComponent],
  exports: [XMoreComponent]
})
export class XMoreModule {}
