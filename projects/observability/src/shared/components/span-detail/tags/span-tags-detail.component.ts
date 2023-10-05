import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, NavigationParams, TypedSimpleChanges } from '@hypertrace/common';
import { FilterOperator, FilterUrlService, ListViewDisplay, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../pages/explorer/explorer.component';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { SPAN_SCOPE } from '../../../graphql/model/schema/span';
import { toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';

@Component({
  selector: 'ht-span-tags-detail',
  styleUrls: ['./span-tags-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tags-details">
      <ng-container *htLoadAsync="this.tagRecords$ as tagRecords">
        <ht-list-view [records]="tagRecords" display="${ListViewDisplay.Plain}" data-sensitive-pii>
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

  public constructor(private readonly explorerService: ExplorerService, private readonly metadataService: MetadataService, private readonly filterUrlService: FilterUrlService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.tags && this.tags) {
      this.buildTagRecords();
    }
  }

  public getExploreNavigationParams = (tag: ListViewRecord): Observable<NavigationParams> =>
    this.metadataService.getAllAttributes(SPAN_SCOPE).pipe(
      map(attributes => this.filterUrlService.getUrlFilters(attributes.map(attribute => ({
        name: attribute.name,
        displayName: attribute.displayName,
        type: toFilterAttributeType(attribute.type)
      })))),
      switchMap(filters => this.explorerService.buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
        { field: 'tags', subpath: tag.key, operator: FilterOperator.Equals, value: tag.value },
        ...filters.map(filter => (
          { field: filter.field, subpath: filter.subpath, operator: filter.operator, value: filter.value }
        ))
      ]))
    );

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
