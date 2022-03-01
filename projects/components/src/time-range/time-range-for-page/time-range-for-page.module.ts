import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '../time-range.module';
import { TimeRangeForPageComponent } from './time-range-for-page.component';

@NgModule({
  declarations: [TimeRangeForPageComponent],
  exports: [TimeRangeForPageComponent],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class TimeRangeForPageModule {}
