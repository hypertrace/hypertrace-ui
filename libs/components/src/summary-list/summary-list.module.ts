import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { SummaryListComponent } from './summary-list.component';

@NgModule({
  declarations: [SummaryListComponent],
  exports: [SummaryListComponent],
  imports: [CommonModule, LoadAsyncModule, FormattingModule, LabelModule, IconModule]
})
export class SummaryListModule {}
