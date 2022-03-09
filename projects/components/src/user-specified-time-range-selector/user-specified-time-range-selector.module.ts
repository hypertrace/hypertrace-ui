import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimeRangeModule } from '../time-range/time-range.module';
import { UserSpecifiedTimeRangeSelectorComponent } from './user-specified-time-range-selector.component';

@NgModule({
  declarations: [UserSpecifiedTimeRangeSelectorComponent],
  exports: [UserSpecifiedTimeRangeSelectorComponent],
  imports: [CommonModule, TimeRangeModule]
})
export class UserSpecifiedTimeRangeSelectorModule {}
