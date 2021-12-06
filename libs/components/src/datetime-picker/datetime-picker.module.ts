import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputModule } from '../input/input.module';
import { LabelModule } from '../label/label.module';
import { TimePickerModule } from '../time-picker/time-picker.module';
import { DatetimePickerComponent } from './datetime-picker.component';
@NgModule({
  imports: [CommonModule, FormsModule, LabelModule, InputModule, TimePickerModule],
  declarations: [DatetimePickerComponent],
  exports: [DatetimePickerComponent]
})
export class DatetimePickerModule {}
