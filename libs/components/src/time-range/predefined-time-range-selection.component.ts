import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { RelativeTimeRange, TimeDuration, TimeRangeService } from '@hypertrace/common';
import { PredefinedTimeDurationService } from './predefined-time-duration.service';

@Component({
  selector: 'ht-predefined-time-range-selection',
  styleUrls: ['./predefined-time-range-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="predefined-time-range-selection">
      <div class="popover-item" (click)="this.onSelectCustom()">Custom</div>
      <div class="divider"></div>
      <div class="popover-item" *ngFor="let time of this.predefinedTimeDurations" (click)="this.onSelect(time)">
        {{ time.toRelativeString() }}
      </div>
    </div>
  `
})
export class PredefinedTimeRangeSelectionComponent {
  @Output()
  public readonly showCustomSelected: EventEmitter<void> = new EventEmitter();

  @Output()
  public readonly selection: EventEmitter<RelativeTimeRange> = new EventEmitter();

  public predefinedTimeDurations: TimeDuration[] = this.predefinedTimeDurationService.getPredefinedTimeDurations();

  public constructor(private readonly predefinedTimeDurationService: PredefinedTimeDurationService) {}

  public onSelectCustom(): void {
    this.showCustomSelected.emit();
  }

  public onSelect(time: TimeDuration): void {
    this.selection.emit(TimeRangeService.toRelativeTimeRange(time.value, time.unit));
  }
}
