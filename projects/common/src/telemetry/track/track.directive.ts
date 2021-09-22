import { fromEvent, Subscription } from 'rxjs';
import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { TypedSimpleChanges } from '../../utilities/types/angular-change-object';
import { TrackUserEventsType } from '../telemetry';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';

@Directive({
  selector: '[htTrack]'
})
export class TrackDirective implements OnChanges, OnDestroy {
  @Input('htTrack')
  public userEvents: TrackUserEventsType[] = [TrackUserEventsType.Click];

  @Input('htTrackLabel')
  public label?: string;

  private readonly subscription: Subscription = new Subscription();
  private trackedEventLabel: string = '';

  public constructor(
    private readonly host: ElementRef,
    private readonly userTelemetryImplService: UserTelemetryImplService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.userEvents) {
      this.setupListeners();
    }

    if (changes.label) {
      this.trackedEventLabel = this.label ?? (this.host.nativeElement as HTMLElement)?.tagName;
    }
  }

  public ngOnDestroy(): void {
    this.clearListeners();
  }

  private setupListeners(): void {
    this.clearListeners();
    this.subscription.add(
      ...this.userEvents.map(userEvent =>
        fromEvent<MouseEvent>(this.host.nativeElement, userEvent).subscribe(eventObj =>
          this.trackUserEvent(userEvent, eventObj)
        )
      )
    );
  }

  private clearListeners(): void {
    this.subscription.unsubscribe();
  }

  private trackUserEvent(userEvent: TrackUserEventsType, eventObj: MouseEvent): void {
    this.userTelemetryImplService.trackEvent(`${userEvent}: ${this.trackedEventLabel}`, {
      target: eventObj.target,
      type: userEvent
    });
  }
}
