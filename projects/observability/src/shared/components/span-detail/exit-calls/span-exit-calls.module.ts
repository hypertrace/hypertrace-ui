import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableModule } from '@hypertrace/components';
import { SpanExitCallsComponent } from './span-exit-calls.component';

@NgModule({
  declarations: [SpanExitCallsComponent],
  exports: [SpanExitCallsComponent],
  imports: [CommonModule, TableModule]
})
export class SpanExitCallsModule {}
