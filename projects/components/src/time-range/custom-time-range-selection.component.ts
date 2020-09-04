import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TimeRange, TimeRangeService, TypedSimpleChanges } from '@hypertrace/common';
import { ButtonRole } from '../button/button';

@Component({
  selector: 'htc-custom-time-range-selection',
  styleUrls: ['./custom-time-range-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="custom-time-range-selection">
      <htc-label class="custom-title" label="Custom Date Range"></htc-label>

      <form class="custom-form">
        <div class="form-inputs">
          <!-- From Date & Time -->
          <htc-datetime-picker label="From" [(date)]="this.from"></htc-datetime-picker>

          <div style="width: 24px;"></div>

          <!-- To Date & Time -->
          <htc-datetime-picker label="To" [(date)]="this.to"></htc-datetime-picker>
        </div>

        <div class="divider"></div>

        <div class="buttons">
          <!-- Cancel -->
          <htc-button class="button" label="Cancel" role="${ButtonRole.Destructive}" (click)="this.onCancel()">
          </htc-button>

          <div style="flex: 1 1 auto;"></div>

          <!-- Apply -->
          <htc-button
            class="button apply-button"
            label="Apply"
            role="${ButtonRole.Primary}"
            (click)="this.onApply()"
            [disabled]="!this.from || !this.to"
          >
          </htc-button>
        </div>
      </form>
    </div>
  `
})
export class CustomTimeRangeSelectionComponent implements OnChanges {
  @Input()
  public readonly timeRange!: TimeRange;

  @Output()
  public readonly timeRangeChange: EventEmitter<TimeRange> = new EventEmitter();

  @Output()
  public readonly cancel: EventEmitter<void> = new EventEmitter();

  public from!: Date;
  public to!: Date;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.timeRange !== undefined) {
      // Need to copy so not mutating original timeRange in case we cancel instead of apply.
      this.from = new Date(this.timeRange.startTime);
      this.to = new Date(this.timeRange.endTime);
    }
  }

  public onCancel(): void {
    this.cancel.emit();
  }

  public onApply(): void {
    this.timeRangeChange.emit(TimeRangeService.toFixedTimeRange(this.from, this.to));
  }
}
