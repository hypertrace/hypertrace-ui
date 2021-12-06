import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TraceCheckboxModule } from '@hypertrace/components';
import { CardListComponent } from './card-list.component';
import { CardContainerComponent } from './container/card-container.component';

@NgModule({
  imports: [CommonModule, TraceCheckboxModule],
  declarations: [CardListComponent, CardContainerComponent],
  exports: [CardListComponent, CardContainerComponent]
})
export class CardListModule {}
