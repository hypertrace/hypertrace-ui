import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, NavigationParams } from '@hypertrace/common';
import { FilterOperator, ListViewDisplay, ListViewRecord } from '@hypertrace/components';
import { ExplorerService, ScopeQueryParam } from '@hypertrace/observability';
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
          <ht-list-view [records]="records" [metadata]="metadata" display="${ListViewDisplay.Plain}" data-sensitive-pii>
            <div class="record-value" *htListViewValueRenderer="let record">
              <div class="value">{{ record.value }}</div>
              <ht-explore-filter-link
                class="filter-link"
                [paramsOrUrl]="this.getExploreNavigationParams | htMemoize: record | async"
                htTooltip="See traces in Explorer"
              >
              </ht-explore-filter-link>
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
  public filterName: string = '';

  public records$?: Observable<ListViewRecord[]>;

  public label?: string;

  public constructor(private readonly explorerService: ExplorerService) {}

  public ngOnChanges(): void {
    this.buildRecords();
  }

  public getExploreNavigationParams = (record: ListViewRecord): Observable<NavigationParams> =>
    this.explorerService.buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
      { field: this.filterName, subpath: record.key, operator: FilterOperator.Equals, value: record.value }
    ]);

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
