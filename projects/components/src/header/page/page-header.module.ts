import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BetaTagModule } from '../../beta-tag/beta-tag.module';
import { BreadcrumbsModule } from '../../breadcrumbs/breadcrumbs.module';
import { FeatureConfigCheckModule } from '../../feature-check/feature-config-check.module';
import { IconModule } from '../../icon/icon.module';
import { LabelModule } from '../../label/label.module';
import { NavigableTabModule } from '../../tabs/navigable/navigable-tab.module';
import { TimeRangeModule } from '../../time-range/time-range.module';
import { UserSpecifiedTimeRangeSelectorModule } from '../../user-specified-time-range-selector/user-specified-time-range-selector.module';
import { PageHeaderComponent } from './page-header.component';

@NgModule({
  declarations: [PageHeaderComponent],
  exports: [PageHeaderComponent],
  imports: [
    IconModule,
    CommonModule,
    TimeRangeModule,
    BreadcrumbsModule,
    LabelModule,
    NavigableTabModule,
    BetaTagModule,
    FeatureConfigCheckModule,
    UserSpecifiedTimeRangeSelectorModule
  ]
})
export class PageHeaderModule {}
