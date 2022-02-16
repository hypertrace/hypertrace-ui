import { NgModule } from '@angular/core';

import { PageTimeRangeComponent } from './page-time-range.component';
import { CommonModule } from '@angular/common';
import { TimeRangeModule } from '../time-range.module';

@NgModule({
  declarations: [PageTimeRangeComponent],
  exports: [PageTimeRangeComponent],
  imports: [CommonModule, TimeRangeModule],
  providers: []
})
export class PageTimeRangeModule {}
