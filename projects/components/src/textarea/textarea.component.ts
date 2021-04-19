import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from '@hypertrace/common';

@Component({
  selector: 'ht-textarea',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field class="fill-container" floatLabel="never">
      <textarea
        class="textarea"
        matInput
        [rows]="this.rowsCount"
        [disabled]="this.disabled"
        [placeholder]="this.placeholder"
        [ngModel]="this.value"
        (ngModelChange)="this.onValueChange($event)"
      >
      </textarea>
    </mat-form-field>
  `
})
export class TextareaComponent implements OnInit {
  @Input()
  public placeholder!: string;

  @Input()
  public value: string | undefined;

  @Input()
  public disabled: boolean | undefined;

  @Input()
  public rowsCount: number = -1;

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  public constructor(private readonly loggerService: LoggerService) {}

  public ngOnInit(): void {
    // tslint:disable-next-line:strict-type-predicates
    if (this.placeholder === undefined) {
      this.loggerService.warn('TextareaComponent requires "placeholder" input');
    }
  }

  public onValueChange(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
