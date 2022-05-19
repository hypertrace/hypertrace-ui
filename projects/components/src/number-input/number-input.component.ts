import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NumberCoercer } from '@hypertrace/common';
import { NumberInputAppearance } from './number-input-appearance';

@Component({
  selector: 'ht-number-input',
  styleUrls: ['./number-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: NumberInputComponent
    }
  ],
  template: `
    <input
      type="number"
      class="number-input"
      [ngClass]="this.appearance"
      [disabled]="this.disabled"
      [ngModel]="this.value"
      (ngModelChange)="this.onValueChange($event)"
    />
  `
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input()
  public value?: number;

  @Input()
  public appearance: NumberInputAppearance = NumberInputAppearance.Border;

  @Input()
  public disabled: boolean = false;

  @Input()
  public minValue?: number;

  @Input()
  public maxValue?: number;

  @Output()
  public readonly valueChange: EventEmitter<number> = new EventEmitter();

  private readonly numberCoercer: NumberCoercer = new NumberCoercer();

  private propagateControlValueChange?: (value: number | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: number | undefined) => void;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  private enforceMinMaxAndEmit(): void {
    if (this.value !== undefined && this.maxValue !== undefined && this.value > this.maxValue) {
      this.value = this.maxValue;
    }

    if (this.value !== undefined && this.minValue !== undefined && this.value < this.minValue) {
      this.value = this.minValue;
    }

    this.valueChange.emit(this.numberCoercer.coerce(this.value));
  }

  public onValueChange(value?: number): void {
    this.value = value;

    this.enforceMinMaxAndEmit();
    this.propagateValueChangeToFormControl(value);
  }

  public writeValue(value?: number): void {
    this.value = value;
    this.enforceMinMaxAndEmit();
    this.cdr.markForCheck();
  }

  public registerOnChange(onChange: (value: number | undefined) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: number | undefined) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public setDisabledState(isDisabled?: boolean): void {
    this.disabled = isDisabled ?? false;
  }

  private propagateValueChangeToFormControl(value: number | undefined): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }
}
