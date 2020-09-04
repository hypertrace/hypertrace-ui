import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'htc-span-detail-call-headers',
  styleUrls: ['./span-detail-call-headers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-headers">
      <htc-label label="Headers" class="title"></htc-label>
      <div class="container">
        <ng-container *htcLoadAsync="this.headerRecords$ as headerRecords">
          <htc-list-view [records]="headerRecords"></htc-list-view>
        </ng-container>
      </div>
    </div>
  `
})
export class SpanDetailCallHeadersComponent implements OnChanges {
  @Input()
  public headers?: Dictionary<unknown>;

  public headerRecords$?: Observable<ListViewRecord[]>;

  public ngOnChanges(): void {
    this.buildHeaderRecords();
  }

  private buildHeaderRecords(): void {
    if (isNil(this.headers)) {
      this.headerRecords$ = EMPTY;
    } else {
      this.headerRecords$ = of(
        Object.keys(this.headers)
          .sort((key1, key2) => key1.localeCompare(key2))
          .map(key => ({
            key: key,
            value: this.headers![key] as string | number
          }))
      );
    }
  }
}
