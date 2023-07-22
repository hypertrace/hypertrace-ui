import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { PrimitiveValue } from '@hypertrace/common';
import { startCase } from 'lodash-es';
import { IconSize } from '../public-api';
import { SummaryItem } from './summary-list-api';

@Component({
  selector: 'ht-summary-list',
  styleUrls: ['./summary-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="summary-list full-container">
      <div class="summary-header" *ngIf="this.title || this.icon">
        <ht-icon class="summary-icon" size="${IconSize.Small}" [icon]="this.icon"></ht-icon>
        <ht-label class="summary-title" size="${IconSize.Small}" [label]="this.title"></ht-label>
      </div>
      <ng-container *ngFor="let item of this.items">
        <ht-label class="summary-value-title" [label]="this.getFormattedLabel(item.label)"></ht-label>
        <ul class="summary-value-list">
          <li class="summary-value" *ngIf="this.getValuesArray(item.value).length === 0">None</li>
          <li
            class="summary-value"
            [class.clickable]="item.clickable"
            *ngFor="let value of this.getValuesArray(item.value)"
            (click)="this.onItemCLick(item)"
          >
            {{ value }}
          </li>
        </ul>
      </ng-container>
    </div>
  `
})
export class SummaryListComponent {
  @Input()
  public title?: string;

  @Input()
  public icon?: IconType;

  @Input()
  public items?: SummaryItem[] = [];

  @Output()
  public readonly itemClick: EventEmitter<SummaryItem> = new EventEmitter();

  public getFormattedLabel(label: string): string {
    return startCase(label.toLowerCase());
  }

  public getValuesArray(value: PrimitiveValue | PrimitiveValue[]): PrimitiveValue[] {
    return Array.isArray(value) ? value : [value];
  }

  public onItemCLick(item: SummaryItem): void {
    item.clickable && this.itemClick.emit(item);
  }
}
