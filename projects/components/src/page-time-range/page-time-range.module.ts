import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimeRangeModule } from '../time-range/time-range.module';
import { PageTimeRangeComponent } from './page-time-range.component';

@NgModule({
  declarations: [PageTimeRangeComponent],
  exports: [PageTimeRangeComponent],
  imports: [CommonModule, TimeRangeModule]
})
export class PageTimeRangeModule {}
