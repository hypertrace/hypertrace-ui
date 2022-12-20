import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { isEnterOrCommaKeyEvent, TypedSimpleChanges } from '@hypertrace/common';
import { debounce, isEmpty } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { InputAppearance } from '../input/input-appearance';

@Component({
  selector: 'ht-input-pill-list',
  template: `
    <div class="input-pill-list" [formGroup]="this.form">
      <div class="header">
        <ht-form-field class="form-field">
          <ht-input
            [disabled]="this.disabled || this.disableAdd || this.disableUpdate"
            class="input primary-input"
            formControlName="inputBuffer"
            (keydown)="this.addBufferValueToList($event)"
            placeholder="Enter a comma separated list of values"
            appearance="${InputAppearance.Border}"
          ></ht-input>
        </ht-form-field>
      </div>

      <ng-container formArrayName="pillControls">
        <div class="pill-list" *ngIf="this.pillControlsArray.value.length > 0">
          <div class="pill" *ngFor="let pillValueControl of this.pillControlsArray?.controls; index as index">
            <ht-form-field class="form-field" [formGroup]="pillValueControl">
              <ht-input
                class="input secondary-input"
                [disabled]="this.shouldDisableUpdate"
                appearance="${InputAppearance.Border}"
                (valueChange)="this.updateValue()"
                formControlName="value"
              ></ht-input>
            </ht-form-field>
            <ht-icon
              class="close-icon"
              [ngClass]="{ disabled: this.shouldDisableUpdate }"
              icon="${IconType.CloseCircle}"
              size="${IconSize.Small}"
              (click)="this.removeValue(index)"
            ></ht-icon>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./input-pill-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputPillListComponent
    }
  ]
})
export class InputPillListComponent implements ControlValueAccessor, OnChanges {
  @Input()
  public readonly values: string[] = [];

  @Input()
  public readonly disableAdd: boolean = false;

  @Input()
  public readonly disableUpdate: boolean = false;

  @Input()
  public readonly disabled: boolean = false;

  @Output()
  public readonly valueChange: EventEmitter<string[]> = new EventEmitter();

  public form: FormGroup = new FormGroup({
    inputBuffer: new FormControl(''),
    pillControls: new FormArray([])
  });

  public currentValues: string[] = [];

  private propagateControlValueChange?: (value: string[]) => void;
  private propagateControlValueChangeOnTouch?: (value: string[]) => void;
  public constructor(private readonly formBuilder: FormBuilder) {}
  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.values) {
      this.initForm(this.values);
    }
  }

  public addBufferValueToList(event: KeyboardEvent): void {
    // Return if the key pressed is not a comma or enter
    if (!isEnterOrCommaKeyEvent(event)) {
      return;
    }
    // Do not propagate Enter key or comma presses
    event.preventDefault();

    // Process input buffer
    const input: string = this.inputBufferFormControl.value.trim();
    const existingValues = this.getValuesFromPills();
    // Add value to the list if it is not empty and not a duplicate
    if (!isEmpty(input) && !existingValues.includes(input)) {
      this.inputBufferFormControl.reset();
      this.pillControlsArray?.insert(0, this.buildSinglePillForm(input));
      this.notifyValueChange();
    }
  }

  public removeValue(index: number): void {
    if (this.shouldDisableUpdate) {
      return;
    }
    this.pillControlsArray.removeAt(index);
    this.notifyValueChange();
  }

  /**
   * Update function is triggered on value update in the input forms.
   * To prevent unnecessary emits, debounce it
   * **/
  public updateValue: () => void = debounce(this.notifyValueChange, 200);

  public get shouldDisableUpdate(): boolean {
    return this.disabled || this.disableUpdate;
  }

  public writeValue(values: string[]): void {
    this.initForm(values);
  }

  public registerOnChange(onChange: (value: string[]) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: string[]) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public get pillControlsArray(): FormArray {
    return this.form.get('pillControls') as FormArray;
  }

  private propagateValueChangeToFormControl(value: string[]): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }

  private buildFormArray(values: string[]): FormArray {
    return this.formBuilder.array(values.map(value => this.buildSinglePillForm(value)));
  }

  private getValuesFromPills(): string[] {
    return (this.pillControlsArray.value ?? []).map((pill: { value: string }) => pill.value);
  }

  private buildSinglePillForm(value: string): FormGroup {
    return new FormGroup({ value: new FormControl(value, Validators.required) });
  }

  private get inputBufferFormControl(): FormControl {
    return this.form.get('inputBuffer') as FormControl;
  }

  private initForm(values: string[]): void {
    this.form.setControl('pillControls', this.buildFormArray(values));
  }

  private notifyValueChange(): void {
    const validValues = this.getValuesFromPills().filter(value => !isEmpty(value));
    this.valueChange.next(validValues);
    this.propagateValueChangeToFormControl(validValues);
  }
}
