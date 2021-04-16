import { LinkModule, IconModule } from '@hypertrace/components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExploreFilterLinkComponent } from './explore-filter-link.component';

@NgModule({
  declarations: [ExploreFilterLinkComponent],
  exports: [ExploreFilterLinkComponent],
  imports: [CommonModule, LinkModule, IconModule]
})
export class ExploreFilterLinkModule {}
