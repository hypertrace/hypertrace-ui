import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { LabelModule } from '../label/label.module';
import { RadioGroupComponent } from './radio-group.component';

@NgModule({
  imports: [CommonModule, FormsModule, MatRadioModule, LabelModule],
  declarations: [RadioGroupComponent],
  exports: [RadioGroupComponent]
})
export class TraceRadioModule {}
