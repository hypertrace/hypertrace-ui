import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '../tooltip/tooltip.module';
import { XMoreModule } from '../x-more/x-more.module';
import { StringArrayDisplayComponent } from './string-array-display.component';

@NgModule({
  declarations: [StringArrayDisplayComponent],
  exports: [StringArrayDisplayComponent],
  imports: [CommonModule, XMoreModule, FormattingModule, TooltipModule],
})
export class StringArrayDisplayModule {}
