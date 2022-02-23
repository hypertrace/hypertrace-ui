import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NumberCoercer, SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { InputAppearance } from './input-appearance';

@Component({
  selector: 'ht-input',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent
    },
    SubscriptionLifecycle
  ],
  template: `
    <mat-form-field [ngClass]="this.getStyleClasses()" floatLabel="never">
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
export class InputComponent<T extends string | number> implements ControlValueAccessor, OnChanges {
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

  @Input()
  public debounceTime?: number;

  @Output()
  public readonly valueChange: EventEmitter<T | undefined> = new EventEmitter();

  private readonly numberCoercer: NumberCoercer = new NumberCoercer();
  private readonly debouncedValueSubject: Subject<T | undefined> = new Subject();

  public placeholderValue: string = '';

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.placeholder) {
      this.placeholderValue = this.placeholder ?? '';
    }

    if (changes.debounceTime) {
      this.setDebouncedSubscription();
    }
  }

  private propagateControlValueChange?: (value: T | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: T | undefined) => void;

  public onValueChange(value?: string): void {
    const coercedValue = this.coerceValueIfNeeded(value);
    this.value = coercedValue;
    this.debouncedValueSubject.next(coercedValue);
    this.propagateValueChangeToFormControl(coercedValue);
  }

  public getStyleClasses(): string[] {
    return [this.appearance, this.disabled ? 'disabled' : ''];
  }

  public writeValue(value?: string): void {
    const coercedValue = this.coerceValueIfNeeded(value);
    this.value = coercedValue;
    this.cdr.markForCheck();
  }

  public registerOnChange(onChange: (value: T | undefined) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: T | undefined) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public setDisabledState(isDisabled?: boolean): void {
    this.disabled = isDisabled ?? false;
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

  private setDebouncedSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();
    this.subscriptionLifecycle.add(
      this.debouncedValueSubject
        .pipe(debounceTime(this.debounceTime ?? 0))
        .subscribe(value => this.valueChange.emit(value))
    );
  }
}
