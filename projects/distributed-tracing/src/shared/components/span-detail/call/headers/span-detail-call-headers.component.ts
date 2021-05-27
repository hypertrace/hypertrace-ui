import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef, ViewChild } from '@angular/core';
import { Color, Dictionary } from '@hypertrace/common';
import { ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'ht-span-detail-call-headers',
  styleUrls: ['./span-detail-call-headers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-headers">
      <ht-label label="Headers" class="title"></ht-label>
      <div class="container" data-sensitive-pii>
        <ng-container *htLoadAsync="this.headerRecords$ as headerRecords">
          <ht-list-view [records]="headerRecords"></ht-list-view>
        </ng-container>
      </div>
      <ng-template #redactedTagTemplate>
        <ht-label-tag backgroundColor=${Color.Gray9} labelColor=${Color.White} label="Redacted"></ht-label-tag>
      </ng-template>
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

  @ViewChild('redactedTagTemplate', { static: true })
  public readonly redactedTagTemplate!: TemplateRef<unknown>;

  private buildHeaderRecords(): void {
    if (isNil(this.headers)) {
      this.headerRecords$ = EMPTY;
    } else {
      this.headerRecords$ = of(
        Object.keys(this.headers)
          .sort((key1, key2) => key1.localeCompare(key2))
          .map(key => {
            const value = this.headers![key] as string | number;
            return {
              key: key,
              value: value === '***' ? this.redactedTagTemplate : value
            };
          })
      );
    }
  }
}
