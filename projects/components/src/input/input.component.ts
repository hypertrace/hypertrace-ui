import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NumberCoercer, TypedSimpleChanges } from '@hypertrace/common';
import { InputAppearance } from './input-appearance';

@Component({
  selector: 'ht-input',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent,
    },
  ],
  template: `
    <mat-form-field [ngClass]="this.getStyleClasses()" floatLabel="never">
      <input
        matInput
        [type]="this.type"
        [min]="this.min"
        [max]="this.max"
        [required]="this.required"
        [disabled]="this.isDisabled"
        [placeholder]="this.placeholderValue"
        [attr.aria-label]="this.ariaLabel || 'input'"
        [ngModel]="this.value"
        (ngModelChange)="this.onValueChange($event)"
      />
    </mat-form-field>
  `,
})
export class InputComponent<T extends string | number> implements ControlValueAccessor, OnChanges {
  @Input()
  public placeholder?: string;

  @Input()
  public value?: T;

  @Input()
  public type: string = 'text';

  @Input()
  public appearance: InputAppearance = InputAppearance.Underline;

  @Input()
  public required: boolean = false;

  @Input()
  public set disabled(disabled: boolean) {
    this.isDisabled = disabled;
  }

  @Input()
  public min?: number | undefined;

  @Input()
  public max?: number | undefined;

  @Input()
  public ariaLabel?: string;

  @Output()
  public readonly valueChange: EventEmitter<T | undefined> = new EventEmitter();

  private readonly numberCoercer: NumberCoercer = new NumberCoercer();

  public placeholderValue: string = '';

  protected isDisabled: boolean = false;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.placeholder) {
      this.placeholderValue = this.placeholder ?? '';
    }
  }

  private propagateControlValueChange?: (value: T | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: T | undefined) => void;

  public onValueChange(value?: string): void {
    const coercedValue = this.coerceValueIfNeeded(value);
    this.value = coercedValue;
    this.valueChange.emit(coercedValue);
    this.propagateValueChangeToFormControl(coercedValue);
  }

  public getStyleClasses(): string[] {
    return [this.appearance, this.isDisabled ? 'disabled' : ''];
  }

  public writeValue(value?: string): void {
    this.value = this.coerceValueIfNeeded(value);
    this.cdr.markForCheck();
  }

  public registerOnChange(onChange: (value: T | undefined) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: T | undefined) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public setDisabledState(isDisabled?: boolean): void {
    this.isDisabled = isDisabled ?? false;
    this.cdr.markForCheck();
  }

  private coerceValueIfNeeded(value?: string): T | undefined {
    switch (this.type) {
      case 'number':
        return typeof value === 'string' ? (this.numberCoercer.coerce(value) as T) : value;
      default:
        return value as T | undefined;
    }
  }

  private propagateValueChangeToFormControl(value: T | undefined): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }
}
