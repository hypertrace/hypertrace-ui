import { ChangeDetectionStrategy, Component, EventEmitter, NgZone, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  FixedTimeRange,
  RelativeTimeRange,
  TimeDuration,
  TimeRange,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { concat, EMPTY, interval, Observable, of, timer } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ButtonRole, ButtonSize } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { PopoverRef } from '../popover/popover-ref';

@Component({
  selector: 'ht-time-range',
  styleUrls: ['./time-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="time-range" *ngIf="this.timeRange$ | async as timeRange">
      <div class="time-range-selector">
        <ht-popover (popoverOpen)="this.onPopoverOpen($event)" [closeOnNavigate]="false">
          <ht-popover-trigger>
            <div class="trigger">
              <ht-icon class="trigger-icon" icon="${IconType.Time}" size="${IconSize.Medium}"></ht-icon>
              <ht-label class="trigger-label" [label]="timeRange.toDisplayString()"></ht-label>
              <ht-icon class="trigger-caret" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></ht-icon>
            </div>
          </ht-popover-trigger>
          <ht-popover-content>
            <div class="popover-content">
              <!-- Predefined Time Ranges -->
              <ht-predefined-time-range-selection
                class="predefined"
                *ngIf="!this.showCustom"
                (showCustomSelected)="this.showCustom = true"
                (selection)="this.setToRelativeTimeRange($event)"
              >
              </ht-predefined-time-range-selection>

              <!-- Custom Time Range -->
              <ht-custom-time-range-selection
                *ngIf="this.showCustom"
                [timeRange]="timeRange"
                (cancel)="this.onPopoverCancel()"
                (timeRangeChange)="this.setToFixedTimeRange($event)"
              >
              </ht-custom-time-range-selection>
            </div>
          </ht-popover-content>
        </ht-popover>
      </div>

      <ht-button
        *ngIf="this.getRefreshButtonData | htMemoize: timeRange | async as refreshButton"
        class="refresh"
        [ngClass]="refreshButton.isEmphasized ? 'emphasized' : ''"
        [label]="refreshButton.text$ | async"
        icon="${IconType.Refresh}"
        size="${ButtonSize.Medium}"
        [role]="refreshButton.role"
        (click)="refreshButton.onClick()"
      >
      </ht-button>
    </div>
  `
})
export class TimeRangeComponent {
  public timeRange$: Observable<TimeRange> = this.timeRangeService.getTimeRangeAndChanges();

  private popoverRef: PopoverRef | undefined;
  private readonly refreshDuration: TimeDuration = new TimeDuration(5, TimeUnit.Minute);

  public showCustom: boolean = false;

  @Output()
  public readonly timeRangeSelected: EventEmitter<TimeRange> = new EventEmitter();

  public constructor(private readonly timeRangeService: TimeRangeService, private readonly ngZone: NgZone) {}

  public onPopoverOpen(popoverRef: PopoverRef): void {
    this.showCustom = false;
    this.popoverRef = popoverRef;
  }

  public onPopoverCancel(): void {
    this.popoverRef && this.popoverRef.close();
  }

  public setToRelativeTimeRange(timeRange: RelativeTimeRange): void {
    this.timeRangeService.setRelativeRange(timeRange.duration.value, timeRange.duration.unit);
    this.timeRangeSelected.emit(timeRange);
    this.popoverRef!.close();
  }

  public setToFixedTimeRange(timeRange: FixedTimeRange): void {
    this.timeRangeSelected.emit(timeRange);
    this.timeRangeService.setFixedRange(timeRange.startTime, timeRange.endTime);
    this.popoverRef!.close();
  }

  public isRelative(timeRange: TimeRange): timeRange is RelativeTimeRange {
    return timeRange instanceof RelativeTimeRange;
  }

  public getRefreshButtonData = (timeRange: TimeRange): Observable<RefreshButtonData> => {
    const lastRefreshTimeMillis = Date.now();
    if (this.isRelative(timeRange)) {
      return concat(
        of({
          text$: of('Refresh'),
          role: ButtonRole.Secondary,
          isEmphasized: false,
          onClick: () => this.onRefresh(timeRange)
        }),
        this.ngZone.runOutsideAngular(() =>
          // Long running timer will prevent zone from stabilizing
          timer(this.refreshDuration.toMillis()).pipe(
            map(() => ({
              text$: interval(new TimeDuration(1, TimeUnit.Minute).toMillis()).pipe(
                startWith(undefined),
                map(() =>
                  new TimeDuration(
                    Date.now() - lastRefreshTimeMillis,
                    TimeUnit.Millisecond
                  ).getMostSignificantUnitOnly()
                ),
                map(duration => `Refresh - updated ${duration.toString()} ago`)
              ),
              role: ButtonRole.Primary,
              isEmphasized: true,
              onClick: () => this.onRefresh(timeRange)
            }))
          )
        )
      );
    }

    return EMPTY;
  };

  private onRefresh(timeRange: RelativeTimeRange): void {
    this.timeRangeService.setRelativeRange(timeRange.duration.value, timeRange.duration.unit);
  }
}

interface RefreshButtonData {
  text$: Observable<string>;
  role: ButtonRole;
  isEmphasized: boolean;
  onClick(): void;
}
