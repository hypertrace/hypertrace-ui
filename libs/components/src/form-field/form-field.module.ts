import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { FormFieldComponent } from './form-field.component';

@NgModule({
  imports: [CommonModule, LabelModule, IconModule, TooltipModule],
  declarations: [FormFieldComponent],
  exports: [FormFieldComponent]
})
export class FormFieldModule {}
