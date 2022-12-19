import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { IconSize } from '../icon/icon-size';
import { InputAppearance } from '../input/input-appearance';

@Component({
  selector: 'ht-input-pill-list',
  template: `
    <div class="input-pill-list">
      <div class="header">
        <ht-input
          class="input primary-input"
          [value]="this.bufferValue$ | async"
          (keydown.enter)="this.addBufferValueToList()"
          (valueChange)="this.addValueToBuffer($event)"
          placeholder="Type in a value and press enter"
          appearance="${InputAppearance.Border}"
        ></ht-input>
      </div>

      <div class="pill-list" *ngIf="this.currentValues.length > 0">
        <div class="pill" *ngFor="let value of this.currentValues; index as index">
          <ht-input
            [value]="value"
            class="input secondary-input"
            appearance="${InputAppearance.Border}"
            (valueChange)="this.updateValue($event, index)"
          ></ht-input>
          <ht-icon
            class="close-icon"
            icon="${IconType.CloseCircle}"
            size="${IconSize.Small}"
            (click)="this.removeValue(index)"
          ></ht-icon>
        </div>
      </div>
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

  @Output()
  public readonly valueChange: EventEmitter<string[]> = new EventEmitter();

  public currentValues: string[] = [];

  private readonly inputValueBuffer: BehaviorSubject<string> = new BehaviorSubject('');
  public readonly bufferValue$: Observable<string> = this.inputValueBuffer.asObservable();

  private propagateControlValueChange?: (value: string[]) => void;
  private propagateControlValueChangeOnTouch?: (value: string[]) => void;
  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.values) {
      this.currentValues = this.values;
    }
  }

  public addBufferValueToList(): void {
    const input: string = this.inputValueBuffer.value;
    // Add value from buffer to the list if its not empty and not a duplicate
    if (!isEmpty(input) && !this.currentValues.includes(input)) {
      this.currentValues.unshift(input);
      this.inputValueBuffer.next('');
      this.notifyValueChange();
    }
  }

  public addValueToBuffer(value: string): void {
    this.inputValueBuffer.next(value);
  }

  public removeValue(index: number): void {
    this.currentValues.splice(index, 1);
    this.notifyValueChange();
  }

  public updateValue(value: string, index: number): void {
    this.currentValues.splice(index, 1, value);
    this.notifyValueChange();
  }

  private notifyValueChange(): void {
    const validValues = this.currentValues.filter(value => !isEmpty(value));
    this.valueChange.next(validValues);
    this.propagateValueChangeToFormControl(validValues);
  }

  public writeValue(values: string[]): void {
    this.currentValues = values;
  }

  public registerOnChange(onChange: (value: string[]) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: string[]) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  private propagateValueChangeToFormControl(value: string[]): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }
}
