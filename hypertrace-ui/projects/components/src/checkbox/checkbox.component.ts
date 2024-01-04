import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';

@Component({
  selector: 'ht-checkbox',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-checkbox
      labelPosition="after"
      [aria-label]="this.label || 'checkbox'"
      [checked]="this.isChecked"
      [disabled]="this.isDisabled"
      [(indeterminate)]="this.indeterminate"
      (change)="this.onCheckboxChange($event)"
      class="ht-checkbox"
      [ngClass]="{ disabled: this.isDisabled }"
    >
      <ht-label class="label" *ngIf="this.label !== undefined && this.label !== ''" [label]="this.label"></ht-label>
    </mat-checkbox>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input()
  public label?: string;

  @Input()
  public set checked(checked: boolean | undefined) {
    this.isChecked = checked ?? false;
  }

  public get checked(): boolean | undefined {
    return this.isChecked;
  }

  @Input()
  public indeterminate?: boolean;

  @Input()
  public set disabled(disabled: boolean | undefined) {
    this.isDisabled = disabled ?? false;
  }

  public get disabled(): boolean {
    return this.isDisabled;
  }

  @Output()
  public readonly checkedChange: EventEmitter<boolean> = new EventEmitter();

  public isChecked: boolean = false;
  public isDisabled: boolean = false;

  private onTouched?: () => void;
  private onChanged?: (value: boolean) => void;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public onCheckboxChange(event: MatCheckboxChange): void {
    this.isChecked = event.checked;
    this.checkedChange.emit(this.isChecked);
    this.onChanged?.(this.isChecked);
    this.onTouched?.();
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this.onChanged = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  public writeValue(isChecked: boolean | undefined): void {
    this.isChecked = isChecked ?? false;
    this.cdr.markForCheck();
  }
}
