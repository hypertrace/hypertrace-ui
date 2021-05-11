import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeUnit } from '@hypertrace/common';
import { InputAppearance } from '../input/input-appearance';

@Component({
  selector: 'ht-duration-selector',
  styleUrls: ['./duration-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="duration-selection">
    <ht-label *ngIf="this.title" class="title" [label]="this.title"></ht-label>

    <div class="duration-config">
      <ht-checkbox
        *ngIf="!this.disableIndefiniteOption"
        label="Indefinitely"
        class="indefinite-duration-checkbox"
        [(checked)]="this.durationConfig.shouldApplyIndefinitely"
        (checkedChange)="this.validateAndEmitDurationConfig()"
      ></ht-checkbox>
      <div class="duration-input" *ngIf="!this.durationConfig.shouldApplyIndefinitely">
        <ht-input
          class="input time-value"
          [(value)]="this.durationConfig.timeValue"
          appearance="${InputAppearance.Border}"
          type="number"
          (keydown.dot)="this.onDecimalInput($event)"
          (valueChange)="this.validateAndEmitDurationConfig()"
        ></ht-input>
        <ht-select
          class="time-unit"
          [(selected)]="this.durationConfig.unit"
          (selectedChange)="this.validateAndEmitDurationConfig()"
        >
          <ht-select-option
            *ngFor="let unit of durationUnitOptions | keyvalue"
            [label]="unit.key"
            [value]="unit.value"
          ></ht-select-option>
        </ht-select>
      </div>
      <ht-label *ngIf="this.inputError" class="error-message" [label]="this.inputError"></ht-label>
    </div>
  </div>`
})
export class DurationSelectorComponent {
  @Input()
  public durationConfig!: DurationConfig;

  @Input()
  public title?: string = 'How long should the rule apply?';

  @Input()
  public disableIndefiniteOption: boolean = false;

  @Output()
  public readonly durationConfigChange: EventEmitter<DurationConfig> = new EventEmitter();

  public readonly durationUnitOptions: Map<string, TimeUnit> = new Map([
    ['Hours', TimeUnit.Hour],
    ['Days', TimeUnit.Day],
    ['Weeks', TimeUnit.Week]
  ]);
  public inputError: string = '';

  public validateAndEmitDurationConfig(): void {
    this.durationConfigChange.emit(this.durationConfig);

    if (!this.durationConfig.shouldApplyIndefinitely) {
      if (this.durationConfig?.timeValue === undefined || this.durationConfig.timeValue <= 0) {
        this.inputError = 'Time value has to be a valid number(>0)';

        return;
      }
    }

    this.inputError = '';
  }

  public onDecimalInput(event: Event): void {
    event.preventDefault();
  }
}

export interface DurationConfig {
  timeValue?: number;
  unit?: TimeUnit;
  shouldApplyIndefinitely: boolean;
}
