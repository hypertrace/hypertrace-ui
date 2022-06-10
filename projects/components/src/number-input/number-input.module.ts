import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '../tooltip/tooltip.module';
import { NumberInputComponent } from './number-input.component';

@NgModule({
  imports: [CommonModule, FormsModule, TooltipModule],
  declarations: [NumberInputComponent],
  exports: [NumberInputComponent]
})
export class NumberInputModule {}
