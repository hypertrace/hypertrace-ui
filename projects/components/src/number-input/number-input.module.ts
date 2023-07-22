import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from './number-input.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [NumberInputComponent],
  exports: [NumberInputComponent]
})
export class NumberInputModule {}
