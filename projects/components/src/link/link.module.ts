import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserTelemetryTrackingModule } from '@hypertrace/common';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LinkComponent } from './link.component';

@NgModule({
  declarations: [LinkComponent],
  exports: [LinkComponent],
  imports: [CommonModule, RouterModule, LetAsyncModule, UserTelemetryTrackingModule]
})
export class LinkModule {}
