import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { LabelModule } from '../label/label.module';
import { PopoverModule } from '../popover/popover.module';
import { TimePickerComponent } from './time-picker.component';

@NgModule({
  imports: [CommonModule, FormsModule, IconModule, LabelModule, InputModule, PopoverModule],
  declarations: [TimePickerComponent],
  exports: [TimePickerComponent]
})
export class TimePickerModule {}
