import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '../time-range.module';
import { PageTimeRangeComponent } from './page-time-range.component';

@NgModule({
  declarations: [PageTimeRangeComponent],
  exports: [PageTimeRangeComponent],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class PageTimeRangeModule {}
