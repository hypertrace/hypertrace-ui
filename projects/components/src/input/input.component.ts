import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NumberCoercer, TypedSimpleChanges } from '@hypertrace/common';
import { InputAppearance } from './input-appearance';

@Component({
  selector: 'htc-input',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field [ngClass]="this.appearance" floatLabel="never">
      <input
        matInput
        [type]="this.type"
        [required]="this.required"
        [disabled]="this.disabled"
        [placeholder]="this.placeholderValue"
        [ngModel]="this.value"
        (ngModelChange)="this.onValueChange($event)"
      />
    </mat-form-field>
  `
})
export class InputComponent<T extends string | number> implements OnChanges {
  @Input()
  public placeholder?: string;

  @Input()
  public value?: T;

  @Input()
  public type?: string;

  @Input()
  public appearance: InputAppearance = InputAppearance.Underline;

  @Input()
  public required: boolean = false;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly valueChange: EventEmitter<T | undefined> = new EventEmitter();

  private readonly numberCoercer: NumberCoercer = new NumberCoercer();

  public placeholderValue: string = '';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.placeholder) {
      this.placeholderValue = this.placeholder ?? '';
    }
  }

  public onValueChange(value?: string): void {
    const coercedValue = this.coerceValueIfNeeded(value);
    this.value = coercedValue;
    this.valueChange.emit(coercedValue);
  }

  private coerceValueIfNeeded(value?: string): T | undefined {
    switch (this.type) {
      case 'number':
        return typeof value === 'string' ? (this.numberCoercer.coerce(value) as T) : value;
      default:
        return value as T | undefined;
    }
  }
}
