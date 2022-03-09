import { NgModule } from '@angular/core';
import { UserSpecifiedTimeRangeSelectorComponent } from './user-specified-time-range-selector.component';

import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '@hypertrace/components';

@NgModule({
  declarations: [UserSpecifiedTimeRangeSelectorComponent],
  exports: [UserSpecifiedTimeRangeSelectorComponent],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class UserSpecifiedTimeRangeSelectorModule {}
