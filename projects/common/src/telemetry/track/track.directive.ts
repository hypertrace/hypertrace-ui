import { Directive, HostListener, Input } from '@angular/core';
import { UserTelemetryInternalService } from '../user-telemetry-internal.service';

@Directive({
  selector: '[htTrack]'
})
export class TrackDirective {
  @Input('htTrack')
  public name!: string;

  public constructor(private readonly userTelemetryInternalService: UserTelemetryInternalService) {}

  @HostListener('click', ['$event'])
  public trackClick(event: MouseEvent): void {
    this.userTelemetryInternalService.trackEvent(`Click: ${this.name}`, { target: event.target, type: event.type });
  }
}
