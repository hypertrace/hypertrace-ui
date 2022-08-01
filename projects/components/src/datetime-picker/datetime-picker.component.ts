import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
          [type]="this.inputType"
          class="date-selector"
          required="true"
          appearance="${InputAppearance.Border}"
          [value]="this.getInputDate()"
          [min]="this.formatDateToDateTimeLocal(this.min)"
          [max]="this.formatDateToDateTimeLocal(this.max)"
          (valueChange)="this.onDateChange($event)"
        >
        </ht-input>
      </div>
    </div>
  `
})
export class DatetimePickerComponent implements ControlValueAccessor {
  @Input()
  public label?: string;

  @Input()
  public showTimeTriggerIcon?: boolean = false;

  @Input()
  public date?: Date = new Date();

  @Input()
  public min?: Date;

  @Input()
  public max?: Date;

  @Input()
  public showDateOnly: boolean = false;

  @Output()
  public readonly dateChange: EventEmitter<Date> = new EventEmitter();

  public inputType: string = this.showDateOnly ? 'date' : 'datetime-local';
  public dateTimeString?: string;

  private propagateControlValueChange?: (value?: Date) => void;
  private propagateControlValueChangeOnTouch?: (value?: Date) => void;

  public getInputDate(): string {
    if (this.showDateOnly) {
      return this.formatDateObjectToISOString(this.date!);
    }

    return this.formatDateToDateTimeLocal(this.date!)!;
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

  public onDateChange(date: string): void {
    if (date === '') {
      return;
    }

    const d: Date = this.formatDateTimeLocalToDate(date);
    d.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    this.date = d;
    this.dateChange.emit(d);
    this.propagateValueChangeToFormControl(d);
  }

  public formatDateToDateTimeLocal(paramDate: Date | undefined): string | undefined {
    if (paramDate !== undefined) {
      return `${this.leftPadYear(paramDate.getFullYear())}-${this.leftPadByZero(
        paramDate.getMonth() + 1
      )}-${this.leftPadByZero(paramDate.getDate())}T\
${this.leftPadByZero(paramDate.getHours())}:${this.leftPadByZero(paramDate.getMinutes())}`;
    }

    return undefined;
  }

  public formatDateObjectToISOString(dateParam: Date): string {
    return dateParam.toISOString().slice(0, 10);
  }

  public formatDateTimeLocalToDate(dateTimeString: string): Date {
    return new Date(dateTimeString);
  }

  public leftPadByZero(param: number): string {
    return `0${param}`.slice(-2);
  }

  public leftPadYear(year: number): string {
    return `000${year}`.slice(-4);
  }
}
