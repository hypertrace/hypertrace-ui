import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import { ToggleSwitchSize } from './toggle-switch-size';

@Component({
  selector: 'ht-toggle-switch',
  styleUrls: ['./toggle-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-switch">
      <mat-slide-toggle
        color="primary"
        [checked]="this.isChecked"
        [ngClass]="{ 'small-slide-toggle': this.size === '${ToggleSwitchSize.Small}', disabled: this.isDisabled }"
        [disabled]="this.isDisabled"
        (change)="this.onToggle($event)"
      >
        <div class="label">{{ this.label }}</div>
      </mat-slide-toggle>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ToggleSwitchComponent,
      multi: true
    }
  ]
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  @Input()
  public label?: string = '';

  @Input()
  public size: ToggleSwitchSize = ToggleSwitchSize.Small;

  @Input()
  public set checked(checked: boolean | undefined) {
    this.isChecked = checked ?? false;
  }

  public get checked(): boolean {
    return this.isChecked;
  }

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

  public onToggle(toggleChange: MatSlideToggleChange): void {
    this.isChecked = toggleChange.checked;
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
