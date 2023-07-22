import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TrackDirective } from './track.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [TrackDirective],
  exports: [TrackDirective]
})
export class UserTelemetryTrackingModule {}
