import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { LoggerService } from '@hypertrace/common';
import { RadioOption } from './radio-option';

@Component({
  selector: 'ht-radio-group',
  styleUrls: ['./radio-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-label *ngIf="this.title" class="title" [label]="this.title"></ht-label>
    <mat-radio-group
      class="radio-group"
      [ngClass]="this.optionsDirection"
      [ngModel]="this.selected!.value"
      (change)="this.onRadioChange($event)"
      [disabled]="this.disabled"
    >
      <mat-radio-button
        class="radio-button"
        *ngFor="let option of options"
        [ngClass]="[this.optionsDirection, this.disabled ? 'disabled' : '']"
        [value]="option.value"
      >
        <ng-container
          *ngTemplateOutlet="
            this.isLabelAString(option.label) ? defaultLabel : option.label;
            context: { $implicit: option.label }
          "
        ></ng-container>
        <span *ngIf="option.description" class="radio-button-description">{{ option.description }}</span>
      </mat-radio-button>
    </mat-radio-group>
    <ng-template #defaultLabel let-label><ht-label class="radio-button-label" [label]="label"></ht-label></ng-template>
  `
})
export class RadioGroupComponent implements OnInit {
  @Input()
  public title!: string;

  @Input()
  public selected: RadioOption | undefined;

  @Input()
  public options: RadioOption[] = [];

  @Input()
  public disabled: boolean | undefined;

  @Input()
  public optionsDirection: OptionsDirection = OptionsDirection.Column;

  @Output()
  public readonly selectedChange: EventEmitter<string> = new EventEmitter();

  public constructor(private readonly loggerService: LoggerService) {}

  public ngOnInit(): void {
    // tslint:disable-next-line:strict-type-predicates
    if (this.title === undefined) {
      this.loggerService.warn('RadioGroupComponent requires "title" input');
    }

    if (this.selected === undefined) {
      this.selected = {
        label: '',
        value: ''
      };
    }
  }

  public onRadioChange(event: MatRadioChange): void {
    this.selected = this.options.find(option => option.value === event.value);
    this.selectedChange.emit(event.value);
  }

  public isLabelAString(label: string | TemplateRef<unknown>): boolean {
    return typeof label === 'string';
  }
}

export const enum OptionsDirection {
  Row = 'row',
  Column = 'column'
}
