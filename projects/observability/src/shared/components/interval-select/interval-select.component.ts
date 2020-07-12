import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IntervalDurationService, TimeDuration, TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption, SelectSize } from '@hypertrace/components';

@Component({
  selector: 'ht-interval-select',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-select
      [selected]="this.interval"
      (selectedChange)="this.onIntervalChange($event)"
      [disabled]="this.isDisabledOrUnselectable()"
      [icon]="this.icon"
      [showBorder]="true"
      [size]="this.size"
    >
      <htc-select-option
        *ngFor="let option of this.intervalSelectOptions"
        [value]="option.value"
        [label]="option.label"
      >
      </htc-select-option>
    </htc-select>
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

  private buildOptions(intervalValues: IntervalValue[] = []): IntervalOption[] {
    return intervalValues.map(value => this.valueAsOption(value));
  }

  private valueAsOption(value: IntervalValue): IntervalOption {
    return {
      value: value,
      label: this.getLabelForIntervalValue(value)
    };
  }

  private getLabelForIntervalValue(value: IntervalValue): string {
    if (value === 'NONE') {
      return 'None';
    }
    if (value === 'AUTO') {
      return `Auto (${this.intervalDurationService.getAutoDuration().toString()})`;
    }

    return value.toString();
  }
}

export type IntervalValue = TimeDuration | 'NONE' | 'AUTO';
type IntervalOption = SelectOption<IntervalValue>;
