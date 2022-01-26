import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LoggerService } from '@hypertrace/common';

@Component({
  selector: 'ht-textarea',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TextareaComponent
    }
  ],
  template: `
    <mat-form-field class="fill-container" floatLabel="never">
      <textarea
        class="textarea"
        matInput
        [rows]="this.rows"
        [disabled]="this.disabled"
        [placeholder]="this.placeholder"
        [ngModel]="this.value"
        (ngModelChange)="this.onValueChange($event)"
      >
      </textarea>
    </mat-form-field>
  `
})
export class TextareaComponent implements ControlValueAccessor, OnInit {
  @Input()
  public placeholder!: string;

  @Input()
  public value: string | undefined;

  @Input()
  public disabled: boolean | undefined;

  @Input()
  public rows: number = 2;

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  public constructor(private readonly loggerService: LoggerService) {}

  public ngOnInit(): void {
    // tslint:disable-next-line:strict-type-predicates
    if (this.placeholder === undefined) {
      this.loggerService.warn('TextareaComponent requires "placeholder" input');
    }
  }

  private propagateControlValueChange?: (value?: string) => void;
  private propagateControlValueChangeOnTouch?: (value?: string) => void;

  public onValueChange(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.propagateValueChangeToFormControl(value);
  }

  public writeValue(value?: string): void {
    this.value = value;
  }

  public registerOnChange(onChange: (value?: string) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: string) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  private propagateValueChangeToFormControl(value?: string): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }
}
