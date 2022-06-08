import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxModule } from '@hypertrace/components';
import { CardListComponent } from './card-list.component';
import { CardContainerComponent } from './container/card-container.component';

@NgModule({
  imports: [CommonModule, CheckboxModule],
  declarations: [CardListComponent, CardContainerComponent],
  exports: [CardListComponent, CardContainerComponent]
})
export class CardListModule {}
