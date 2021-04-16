import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule, LinkModule } from '@hypertrace/components';
import { ExploreFilterLinkComponent } from './explore-filter-link.component';

@NgModule({
  declarations: [ExploreFilterLinkComponent],
  exports: [ExploreFilterLinkComponent],
  imports: [CommonModule, LinkModule, IconModule]
})
export class ExploreFilterLinkModule {}
