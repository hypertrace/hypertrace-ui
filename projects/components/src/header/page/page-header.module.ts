import { HeaderContentModule } from '../header-content/header-content.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BetaTagModule } from '../../beta-tag/beta-tag.module';
import { BreadcrumbsModule } from '../../breadcrumbs/breadcrumbs.module';
import { IconModule } from '../../icon/icon.module';
import { LabelModule } from '../../label/label.module';
import { NavigableTabModule } from '../../tabs/navigable/navigable-tab.module';
import { TimeRangeModule } from '../../time-range/time-range.module';
import { PageHeaderComponent } from './page-header.component';
import { PageTimeRangeModule } from '../../time-range/page-time-range/page-time-range.module';

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
    PageTimeRangeModule,
    HeaderContentModule
  ]
})
export class PageHeaderModule {}
