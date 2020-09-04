import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IntervalDurationService, TimeDuration, TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption, SelectSize } from '@hypertrace/components';

@Component({
  selector: 'ht-interval-select',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-select
      [selected]="this.interval"
      (selectedChange)="this.onIntervalChange($event)"
      [disabled]="this.isDisabledOrUnselectable()"
      [icon]="this.icon"
      [showBorder]="true"
      [size]="this.size"
    >
      <ht-select-option *ngFor="let option of this.intervalSelectOptions" [value]="option.value" [label]="option.label">
      </ht-select-option>
    </ht-select>
  `
})
export class IntervalSelectComponent implements OnChanges {
  @Input()
  public interval?: IntervalValue;

  @Input()
  public intervalOptions?: IntervalValue[];

  @Input()
  public disabled: boolean = false;

  @Input()
  public showIcon: boolean = false;

  @Input()
  public size: SelectSize = SelectSize.Medium;

  @Output()
  public readonly intervalChange: EventEmitter<IntervalValue> = new EventEmitter();

  public intervalSelectOptions: IntervalOption[] = [];

  public get icon(): IconType | undefined {
    return this.showIcon ? IconType.Time : undefined;
  }

  public constructor(private readonly intervalDurationService: IntervalDurationService) {}

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.intervalOptions) {
      this.intervalSelectOptions = this.buildOptions(this.intervalOptions);
    }
  }

  public onIntervalChange(value: IntervalValue): void {
    this.intervalChange.next(value);
  }

  public isDisabledOrUnselectable(): boolean {
    return this.disabled || this.intervalSelectOptions.length <= 1;
  }

  private buildOptions(availableIntervals: IntervalValue[] = []): IntervalOption[] {
    return availableIntervals.map(availableInterval => this.valueAsOption(availableInterval, availableIntervals));
  }

  private valueAsOption(interval: IntervalValue, availableIntervals: IntervalValue[]): IntervalOption {
    return {
      value: interval,
      label: this.getLabelForIntervalValue(interval, availableIntervals)
    };
  }

  private getLabelForIntervalValue(interval: IntervalValue, availableIntervals: IntervalValue[]): string {
    if (interval === 'NONE') {
      return 'None';
    }
    if (interval === 'AUTO') {
      return `Auto (${this.intervalDurationService
        .getAutoDurationFromTimeDurations(this.getTimeDurationsFromIntervalDurations(availableIntervals))
        .toString()})`;
    }

    return interval.toString();
  }

  private getTimeDurationsFromIntervalDurations(intervals: IntervalValue[]): TimeDuration[] {
    return intervals.filter((interval): interval is TimeDuration => interval instanceof TimeDuration);
  }
}

export type IntervalValue = TimeDuration | 'NONE' | 'AUTO';
type IntervalOption = SelectOption<IntervalValue>;
