import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectModule } from '@hypertrace/components';
import { IntervalSelectComponent } from './interval-select.component';

@NgModule({
  declarations: [IntervalSelectComponent],
  exports: [IntervalSelectComponent],
  imports: [SelectModule, CommonModule]
})
export class IntervalSelectModule {}
