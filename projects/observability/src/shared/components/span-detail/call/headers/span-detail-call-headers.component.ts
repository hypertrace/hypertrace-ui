import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { ListViewDisplay, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'ht-span-detail-call-headers',
  styleUrls: ['./span-detail-call-headers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-headers">
      <ht-label [label]="this.title" class="title"></ht-label>
      <div class="container" data-sensitive-pii>
        <ng-container *htLoadAsync="this.records$ as records">
          <ht-list-view
            [records]="records"
            [metadata]="this.metadata"
            display="${ListViewDisplay.Plain}"
          ></ht-list-view>
        </ng-container>
      </div>
    </div>
  `
})
export class SpanDetailCallHeadersComponent implements OnChanges {
  @Input()
  public data?: Dictionary<unknown>;

  @Input()
  public metadata?: Dictionary<Dictionary<unknown>>;

  @Input()
  public title?: string;

  public records$?: Observable<ListViewRecord[]>;

  public label?: string;

  public ngOnChanges(): void {
    this.buildRecords();
  }

  private buildRecords(): void {
    if (isNil(this.data)) {
      this.records$ = EMPTY;
    } else {
      this.records$ = of(
        Object.keys(this.data)
          .sort((key1, key2) => key1.localeCompare(key2))
          .map(key => ({
            key: key,
            value: this.data![key] as string | number
          }))
      );
    }
  }
}
