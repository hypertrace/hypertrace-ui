import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FeatureConfigCheckModule } from '../../feature-check/feature-config-check.module';
import { TimeRangeModule } from '../time-range.module';
import { PageTimeRangeComponent } from './page-time-range.component';

@NgModule({
  declarations: [PageTimeRangeComponent],
  exports: [PageTimeRangeComponent],
  imports: [CommonModule, TimeRangeModule, FeatureConfigCheckModule],
  providers: []
})
export class PageTimeRangeModule {}
