import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { NavigationParams } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-summary-value',
  styleUrls: ['./summary-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-summary-value" *ngIf="this.value" [htTooltip]="this.tooltipText">
      <ht-icon *ngIf="this.icon" [icon]="this.icon" size="${IconSize.Small}" class="icon"></ht-icon>
      <div class="dot" *ngIf="!this.icon"></div>
      <div class="label" *ngIf="this.label">{{ this.label }}:</div>
      <ht-link
        *ngIf="this.summaryValueDisplayStyle === '${SummaryValueDisplayStyle.Link}'; else textValue"
        class="link"
        [paramsOrUrl]="this.paramsOrUrl"
        >{{ this.value }}</ht-link
      >
      <ng-template #textValue>
        <div class="value">{{ this.value }}</div>
      </ng-template>
    </div>
  `
})
export class SummaryValueComponent implements OnChanges {
  @Input()
  public value!: string;

  @Input()
  public icon?: string;

  @Input()
  public label?: string;

  @Input()
  public tooltip?: string;

  @Input()
  public summaryValueDisplayStyle: SummaryValueDisplayStyle = SummaryValueDisplayStyle.Text;

  @Input()
  public paramsOrUrl?: NavigationParams | string;

  public tooltipText?: string;

  public ngOnChanges(): void {
    if (!isEmpty(this.tooltip)) {
      this.tooltipText = this.tooltip;
    } else if (!isEmpty(this.label) && !isEmpty(this.value)) {
      this.tooltipText = `${this.label} ${this.value}`;
    } else if (!isEmpty(this.value)) {
      this.tooltipText = this.value;
    } else {
      this.tooltipText = undefined;
    }
  }
}

export const enum SummaryValueDisplayStyle {
  Text = 'text',
  Link = 'link'
}
