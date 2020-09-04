import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { BreadcrumbsComponent } from './breadcrumbs.component';

@NgModule({
  imports: [CommonModule, IconModule, LabelModule, TooltipModule],
  declarations: [BreadcrumbsComponent],
  exports: [BreadcrumbsComponent]
})
export class BreadcrumbsModule {}
