import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { TypedSimpleChanges } from '../../utilities/types/angular-change-object';
import { TrackUserEventsType } from '../telemetry';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';

@Directive({
  selector: '[htTrack]'
})
export class TrackDirective implements OnInit, OnChanges, OnDestroy {
  @Input('htTrack')
  public userEvents: string[] = [TrackUserEventsType.Click];

  @Input('htTrackLabel')
  public label?: string;

  private activeSubscriptions: Subscription = new Subscription();
  private trackedEventLabel: string = '';

  public constructor(
    private readonly host: ElementRef,
    private readonly userTelemetryImplService: UserTelemetryImplService
  ) {}

  public ngOnInit(): void {
    this.setupListeners();
  }

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
    this.activeSubscriptions = new Subscription();

    this.activeSubscriptions.add(
      ...this.userEvents?.map(userEvent =>
        fromEvent<MouseEvent>(this.host.nativeElement, userEvent).subscribe(eventObj =>
          this.trackUserEvent(userEvent, eventObj)
        )
      )
    );
  }

  private clearListeners(): void {
    this.activeSubscriptions.unsubscribe();
  }

  private trackUserEvent(userEvent: string, eventObj: MouseEvent): void {
    const targetElement = eventObj.target as HTMLElement;
    this.userTelemetryImplService.trackEvent(`${userEvent}: ${this.trackedEventLabel}`, {
      tagName: targetElement.tagName,
      className: targetElement.className,
      type: userEvent
    });
  }
}
