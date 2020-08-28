import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { ButtonModule } from '@hypertrace/components';
import { TimelineCardContainerComponent } from './container/timeline-card-container.component';
import { TimelineCardListComponent } from './timeline-card-list.component';

@NgModule({
  imports: [CommonModule, FormattingModule, ButtonModule],
  declarations: [TimelineCardListComponent, TimelineCardContainerComponent],
  exports: [TimelineCardListComponent, TimelineCardContainerComponent]
})
export class TimelineCardListModule {}
