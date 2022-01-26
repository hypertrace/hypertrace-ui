import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Time, TypedSimpleChanges } from '@hypertrace/common';
import { InputAppearance } from '../input/input-appearance';

@Component({
  selector: 'ht-datetime-picker',
  styleUrls: ['./datetime-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DatetimePickerComponent
    }
  ],
  template: `
    <div class="datetime-picker">
      <ht-label *ngIf="this.label" [label]="this.label" class="datetime-label"></ht-label>

      <div class="datetime-controls">
        <ht-input
          type="date"
          class="date-selector"
          required="true"
          appearance="${InputAppearance.Border}"
          [value]="this.getInputDate()"
          (valueChange)="this.onDateChange($event)"
        >
        </ht-input>

        <ng-container *ngIf="!this.showDateOnly"
          ><ht-time-picker
            class="time-selector"
            [time]="this.time"
            [showTimeTriggerIcon]="this.showTimeTriggerIcon"
            (timeChange)="this.onTimeChange($event)"
          ></ht-time-picker
        ></ng-container>
      </div>
    </div>
  `
})
export class DatetimePickerComponent implements ControlValueAccessor, OnChanges {
  @Input()
  public label?: string;

  @Input()
  public showTimeTriggerIcon?: boolean = false;

  @Input()
  public date?: Date = new Date();

  @Input()
  public showDateOnly: boolean = false;

  @Output()
  public readonly dateChange: EventEmitter<Date> = new EventEmitter();

  public time?: Time;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.date) {
      this.time = this.date !== undefined ? this.getInputTime(this.date) : undefined;
    }
  }

  private propagateControlValueChange?: (value?: Date) => void;
  private propagateControlValueChangeOnTouch?: (value?: Date) => void;

  public getInputDate(): string {
    return this.date?.toISOString().slice(0, 10) ?? '';
  }

  public writeValue(value?: Date): void {
    this.date = value;
  }

  public registerOnChange(onChange: (value?: Date) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: Date) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  private propagateValueChangeToFormControl(value?: Date): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }

  private getInputTime(date: Date): Time {
    return new Time(date.getHours(), date.getMinutes());
  }

  public onDateChange(date: string): void {
    // The html input uses the format YYYY-MM-DD
    const d: Date = new Date(this.date!);
    const yearMonthDay = date.split('-');
    d.setFullYear(Number(yearMonthDay[0]), Number(yearMonthDay[1]) - 1, Number(yearMonthDay[2]));
    this.date = d;
    this.dateChange.emit(d);
    this.propagateValueChangeToFormControl(d);
  }

  public onTimeChange(time: Time): void {
    this.time = time;
    this.date?.setUTCHours(time.hours, time.minutes, time.seconds, time.milliseconds);
    this.dateChange.emit(this.date);
    this.propagateValueChangeToFormControl(this.date);
  }
}
