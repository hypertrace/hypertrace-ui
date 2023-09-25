import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SpanDetailCallBodyModule } from '../call/body/span-detail-call-body.module';
import { SpanDetailCallHeadersModule } from '../call/headers/span-detail-call-headers.module';
import { SpanRequestDetailComponent } from './span-request-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SpanDetailCallHeadersModule,
    SpanDetailCallBodyModule
  ],
  declarations: [SpanRequestDetailComponent],
  exports: [SpanRequestDetailComponent]
})
export class SpanRequestDetailModule {}
