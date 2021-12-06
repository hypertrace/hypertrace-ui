import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemoizeModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { DatetimePickerModule } from '../datetime-picker/datetime-picker.module';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { LabelModule } from '../label/label.module';
import { PopoverModule } from '../popover/popover.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CustomTimeRangeSelectionComponent } from './custom-time-range-selection.component';
import { PredefinedTimeRangeSelectionComponent } from './predefined-time-range-selection.component';
import { TimeRangeComponent } from './time-range.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    LabelModule,
    InputModule,
    ButtonModule,
    PopoverModule,
    DatetimePickerModule,
    TooltipModule,
    MemoizeModule
  ],
  declarations: [TimeRangeComponent, PredefinedTimeRangeSelectionComponent, CustomTimeRangeSelectionComponent],
  exports: [TimeRangeComponent]
})
export class TimeRangeModule {}
