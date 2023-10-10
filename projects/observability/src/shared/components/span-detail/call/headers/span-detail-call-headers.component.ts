import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, TypedSimpleChanges } from '@hypertrace/common';
import { FilterAttribute, FilterUrlService, ListViewDisplay, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'ht-span-detail-call-headers',
  styleUrls: ['./span-detail-call-headers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-headers">
      <ht-label [label]="this.title" class="title"></ht-label>
      <div class="container">
        <ng-container *htLoadAsync="this.records$ as records">
          <ht-list-view
            [records]="records"
            [metadata]="this.metadata"
            display="${ListViewDisplay.Plain}"
            data-sensitive-pii
          >
            <div class="record-value" *htListViewValueRenderer="let record">
              <div class="value">{{ record.value }}</div>
              <ht-filter-button
                *htLoadAsync="this.metadata$ as metadata"
                class="filter-button"
                [attribute]="this.getFilterAttribute | htMemoize: metadata"
                [metadata]="metadata"
                [value]="record.value"
                [subpath]="record.key"
                htTooltip="See traces in Explorer"
              ></ht-filter-button>
            </div>
          </ht-list-view>
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

  @Input()
  public fieldName: string = '';

  @Input()
  public scope?: string;

  public records$?: Observable<ListViewRecord[]>;

  public label?: string;

  public metadata$?: Observable<FilterAttribute[]>;

  public constructor(private readonly filterUrlService: FilterUrlService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.buildRecords();
    }

    if (changes.scope && this.scope) {
      this.metadata$ = this.filterUrlService.getAllFilterAttributesForScope(this.scope);
    }
  }

  public getFilterAttribute = (metadata: FilterAttribute[]): FilterAttribute | undefined =>
    metadata.find(attribute => attribute.name.toLowerCase().includes(this.fieldName?.toLowerCase()));

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
