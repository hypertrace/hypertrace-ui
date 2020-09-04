import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
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
  selector: 'htc-time-range',
  styleUrls: ['./time-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="time-range" *ngIf="this.timeRange$ | async as timeRange">
      <div class="time-range-selector">
        <htc-popover (popoverOpen)="this.onPopoverOpen($event)" [closeOnNavigate]="false">
          <htc-popover-trigger>
            <div class="trigger">
              <htc-icon class="trigger-icon" icon="${IconType.Time}" size="${IconSize.Large}"></htc-icon>
              <htc-label class="trigger-label" [label]="timeRange.toDisplayString()"></htc-label>
              <htc-icon class="trigger-caret" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></htc-icon>
            </div>
          </htc-popover-trigger>
          <htc-popover-content>
            <div class="popover-content">
              <!-- Predefined Time Ranges -->
              <htc-predefined-time-range-selection
                class="predefined"
                *ngIf="!this.showCustom"
                (showCustomSelected)="this.showCustom = true"
                (selection)="this.setToRelativeTimeRange($event)"
              >
              </htc-predefined-time-range-selection>

              <!-- Custom Time Range -->
              <htc-custom-time-range-selection
                *ngIf="this.showCustom"
                [timeRange]="timeRange"
                (cancel)="this.onPopoverCancel()"
                (timeRangeChange)="this.setToFixedTimeRange($event)"
              >
              </htc-custom-time-range-selection>
            </div>
          </htc-popover-content>
        </htc-popover>
      </div>

      <htc-button
        *ngIf="this.getRefreshButtonData | htcMemoize: timeRange | async as refreshButton"
        class="refresh"
        [label]="refreshButton.text$ | async"
        icon="${IconType.Refresh}"
        size="${ButtonSize.Medium}"
        [role]="refreshButton.role"
        (click)="refreshButton.onClick()"
      >
      </htc-button>
    </div>
  `
})
export class TimeRangeComponent {
  public timeRange$: Observable<TimeRange> = this.timeRangeService.getTimeRangeAndChanges();

  private popoverRef: PopoverRef | undefined;
  private readonly refreshDuration: TimeDuration = new TimeDuration(5, TimeUnit.Minute);

  public showCustom: boolean = false;

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
    this.popoverRef!.close();
  }

  public setToFixedTimeRange(timeRange: FixedTimeRange): void {
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
  onClick(): void;
}
