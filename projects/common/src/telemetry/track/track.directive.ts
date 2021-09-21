import { Directive, HostListener, Input } from '@angular/core';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';

@Directive({
  selector: '[htTrack]'
})
export class TrackDirective {
  @Input('htTrack')
  public name!: string;

  public constructor(private readonly userTelemetryImplService: UserTelemetryImplService) {}

  @HostListener('click', ['$event'])
  public trackClick(event: MouseEvent): void {
    this.userTelemetryImplService.trackEvent(`Click: ${this.name}`, { target: event.target, type: event.type });
  }
}
