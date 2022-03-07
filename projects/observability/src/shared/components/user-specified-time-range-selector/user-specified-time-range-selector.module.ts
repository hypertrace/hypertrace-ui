import { NgModule } from '@angular/core';
import { UserSpecifiedTimeRangeSelector } from './user-specified-time-range-selector.component';

import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '../../../../../components/src/time-range/time-range.module';

@NgModule({
  declarations: [UserSpecifiedTimeRangeSelector],
  exports: [UserSpecifiedTimeRangeSelector],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class UserSpecifiedTimeRangeSelectorModule {}
