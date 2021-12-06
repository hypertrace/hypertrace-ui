import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { CheckboxComponent } from './checkbox.component';

@NgModule({
  imports: [CommonModule, FormsModule, MatCheckboxModule, IconModule, LabelModule],
  declarations: [CheckboxComponent],
  exports: [CheckboxComponent]
})
export class TraceCheckboxModule {}
