import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Time } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { InputAppearance } from '../input/input-appearance';
import { PredefinedTimeService } from '../time-range/predefined-time.service';

@Component({
  selector: 'ht-datetime-picker',
  styleUrls: ['./datetime-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

        <ht-popover class="time-selector" [closeOnClick]="true">
          <ht-popover-trigger>
            <div class="popover-trigger">
              <ht-icon class="trigger-icon" icon="${IconType.Time}" size="${IconSize.Large}"></ht-icon>
              <ht-label class="trigger-label" [label]="this.getInputTime()"></ht-label>
              <ht-icon class="trigger-caret" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></ht-icon>
            </div>
          </ht-popover-trigger>
          <ht-popover-content>
            <div class="popover-content">
              <div class="popover-item" *ngFor="let time of this.predefinedTimes" (click)="this.onTimeChange(time)">
                {{ time.label }}
              </div>
            </div>
          </ht-popover-content>
        </ht-popover>
      </div>
    </div>
  `
})
export class DatetimePickerComponent {
  public readonly predefinedTimes: Time[] = this.predefinedTimeService.getPredefinedTimes();

  @Input()
  public label?: string;

  @Input()
  public date: Date = new Date();

  @Output()
  public readonly dateChange: EventEmitter<Date> = new EventEmitter();

  public constructor(private readonly predefinedTimeService: PredefinedTimeService) {}

  public getInputDate(): string {
    return this.date.toISOString().slice(0, 10);
  }

  public getInputTime(): string {
    return new Time(this.date.getHours(), this.date.getMinutes()).label;
  }

  public onDateChange(date: string): void {
    // The html input uses the format YYYY-MM-DD
    const d: Date = new Date(this.date);
    const yearMonthDay = date.split('-');
    d.setFullYear(Number(yearMonthDay[0]), Number(yearMonthDay[1]) - 1, Number(yearMonthDay[2]));
    this.dateChange.emit(d);
  }

  public onTimeChange(time: Time): void {
    this.date.setHours(time.hours, time.minutes, time.seconds, time.milliseconds);
    this.dateChange.emit(this.date);
  }
}
