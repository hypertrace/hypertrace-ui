import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { PrimitiveValue } from '@hypertrace/common';
import { startCase } from 'lodash-es';
import { SummaryItem } from './summary-list-api';

@Component({
  selector: 'ht-summary-list',
  styleUrls: ['./summary-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="summary-list full-container">
      <div class="summary-header" *ngIf="this.title || this.icon">
        <ht-icon class="summary-icon" [icon]="this.icon"></ht-icon>
        <ht-label class="summary-title" [label]="this.title"></ht-label>
      </div>
      <ng-container *ngFor="let item of this.items">
        <ht-label class="summary-value-title" [label]="this.getFormattedLabel(item)"></ht-label>
        <ul class="summary-value-list">
          <li class="summary-value" *ngIf="this.getValuesArray(item).length === 0">None</li>
          <li class="summary-value" *ngFor="let value of this.getValuesArray(item)">{{ value }}</li>
        </ul>
      </ng-container>
    </div>
  `
})
export class SummaryListComponent {
  @Input()
  public title?: string = 'External';

  @Input()
  public icon?: IconType = IconType.External;

  @Input()
  public items?: SummaryItem[] = [];

  public getFormattedLabel(item: SummaryItem): string {
    return startCase(item.label.trim().replace('-', ' ').replace('_', ' ').toLowerCase());
  }

  public getValuesArray(item: SummaryItem): PrimitiveValue[] {
    return Array.isArray(item.value) ? item.value : [item.value];
  }
}
