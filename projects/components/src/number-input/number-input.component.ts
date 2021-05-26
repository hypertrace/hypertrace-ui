import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NumberCoercer } from '@hypertrace/common';
import { NumberInputAppearance } from './number-input-appearance';

@Component({
  selector: 'ht-number-input',
  styleUrls: ['./number-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class NumberInputComponent {
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

  private enforceMinMaxAndEmit(): void {
    if (this.value !== undefined && this.maxValue !== undefined && this.value > this.maxValue) {
      this.value = this.maxValue;
    }

    if (this.value !== undefined && this.minValue !== undefined && this.value < this.minValue) {
      this.value = this.minValue;
    }

    this.valueChange.emit(this.value);
  }

  public onValueChange(value?: number): void {
    this.value = this.numberCoercer.coerce(value);

    this.enforceMinMaxAndEmit();
  }
}
