import { NgModule } from '@angular/core';
import { UserSpecifiedTimeRangeSelectorComponent } from './user-specified-time-range-selector.component';

import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '../../../../../components/src/time-range/time-range.module';

@NgModule({
  declarations: [UserSpecifiedTimeRangeSelectorComponent],
  exports: [UserSpecifiedTimeRangeSelectorComponent],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class UserSpecifiedTimeRangeSelectorModule {}
