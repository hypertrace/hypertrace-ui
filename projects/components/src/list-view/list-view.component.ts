import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ht-list-view',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-view">
      <div *ngIf="this.header" class="header-row">
        <div class="header-key-label">
          <span>{{ this.header.keyLabel }}</span>
        </div>
        <div class="header-value-label">
          <span>{{ this.header.valueLabel }}</span>
        </div>
      </div>
      <div class="data-row" *ngFor="let record of this.records">
        <div class="key">
          <span>{{ record.key }}</span>
        </div>
        <div class="value">
          <span>{{ record.value }}</span>
        </div>
      </div>
    </div>
  `
})
export class ListViewComponent {
  @Input()
  public header?: ListViewHeader;

  @Input()
  public records?: ListViewRecord[];
}

export interface ListViewHeader {
  keyLabel: string;
  valueLabel: string;
}

export interface ListViewRecord {
  key: string;
  value: string | number;
}
