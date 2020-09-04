import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'htc-list-view',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-view">
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
  public records?: ListViewRecord[];
}

export interface ListViewRecord {
  key: string;
  value: string | number;
}
