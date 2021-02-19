import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SummaryValueDisplayStyle } from '../summary-value/summary-value.component';

@Component({
  selector: 'ht-summary-values',
  styleUrls: ['./summary-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-summary-values" data-sensitive-pii>
      <ht-summary-value
        [icon]="this.icon"
        [value]="this.displayValue"
        [label]="this.label"
        [tooltip]="this.tooltip"
        summaryValueDisplayStyle="${SummaryValueDisplayStyle.Text}"
        class="summary-value"
      ></ht-summary-value>
      <ng-container *ngIf="this.additionalValues && this.additionalValues!.length > 0">
        <div class="additional-values" [htTooltip]="detailsTemplate">
          <span class="count">+{{ this.additionalValues!.length }}</span>
        </div>
        <ng-template #detailsTemplate>
          <div class="tooltip-contents">
            <span *ngFor="let value of this.additionalValues" class="value">
              {{ value }}
            </span>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class SummaryValuesComponent implements OnChanges {
  @Input()
  public values?: string[];

  @Input()
  public icon?: string;

  @Input()
  public label?: string;

  @Input()
  public tooltip?: string;

  public displayValue?: string;
  public additionalValues?: string[];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.values) {
      this.displayValue = this.values && this.values?.length > 0 ? this.values[0] : undefined;
      this.additionalValues = this.values?.slice(1);
    }
  }
}
