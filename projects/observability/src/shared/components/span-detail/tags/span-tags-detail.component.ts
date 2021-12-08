import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, NavigationParams, TypedSimpleChanges } from '@hypertrace/common';
import { FilterOperator, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../pages/explorer/explorer.component';

@Component({
  selector: 'ht-span-tags-detail',
  styleUrls: ['./span-tags-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tags-details">
      <ng-container *htLoadAsync="this.tagRecords$ as tagRecords">
        <ht-list-view [records]="tagRecords" data-sensitive-pii>
          <div class="tag-value" *htListViewValueRenderer="let record">
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
  `
})
export class SpanTagsDetailComponent implements OnChanges {
  @Input()
  public tags?: Dictionary<unknown>;

  public tagRecords$?: Observable<ListViewRecord[]>;

  public constructor(private readonly explorerService: ExplorerService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.tags && this.tags) {
      this.buildTagRecords();
    }
  }

  public getExploreNavigationParams = (tag: ListViewRecord): Observable<NavigationParams> =>
    this.explorerService.buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
      { field: 'tags', operator: FilterOperator.ContainsKeyValue, value: [tag.key, tag.value] }
    ]);

  private buildTagRecords(): void {
    if (isNil(this.tags)) {
      this.tagRecords$ = EMPTY;
    } else {
      this.tagRecords$ = of(
        Object.keys(this.tags)
          .sort((key1, key2) => key1.localeCompare(key2))
          .map(key => ({
            key: key,
            value: this.tags![key] as string | number
          }))
      );
    }
  }
}
