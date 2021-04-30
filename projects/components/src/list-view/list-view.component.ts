import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ht-list-view',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-view">
      <div *ngIf="this.headerKeys && this.headerKeys.length === 2" class="header">
        <div class="header-key" *ngFor="let headerKey of this.headerKeys">
          <span>{{ this.headerKey }}</span>
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
  public headerKeys?: [string, string];

  @Input()
  public records?: ListViewRecord[];
}

export interface ListViewRecord {
  key: string;
  value: string | number;
}
