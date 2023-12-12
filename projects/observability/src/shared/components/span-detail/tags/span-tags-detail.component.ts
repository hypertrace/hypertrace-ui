import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, TypedSimpleChanges } from '@hypertrace/common';
import { FilterAttribute, ListViewDisplay, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';

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
            <ng-container *ngIf="this.showFilters">
              <ht-filter-button
                *htLetAsync="this.metadata$ as metadata"
                class="filter-button"
                [attribute]="this.getFilterAttribute | htMemoize: metadata"
                [metadata]="metadata"
                [value]="record.value"
                [subpath]="record.key"
                htTooltip="See traces in Explorer"
              ></ht-filter-button>
            </ng-container>
          </div>
        </ht-list-view>
      </ng-container>
    </div>
  `,
})
export class SpanTagsDetailComponent implements OnChanges {
  @Input()
  public tags?: Dictionary<unknown>;

  @Input()
  public scope?: string;

  @Input()
  public showFilters: boolean = true;

  public tagRecords$?: Observable<ListViewRecord[]>;
  public metadata$?: Observable<FilterAttribute[]>;

  public constructor(private readonly metadataService: MetadataService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.tags && this.tags) {
      this.buildTagRecords();
    }

    if (changes.scope && this.scope && this.showFilters) {
      this.metadata$ = this.metadataService.getAllAttributes(this.scope).pipe(
        map(metadata =>
          metadata.map(attributeMetadata => ({
            name: attributeMetadata.name,
            displayName: attributeMetadata.displayName,
            type: toFilterAttributeType(attributeMetadata.type),
          })),
        ),
      );
    }
  }

  public getFilterAttribute = (metadata?: FilterAttribute[]): FilterAttribute | undefined =>
    metadata?.find(attribute => attribute.name.toLowerCase().includes('tags'.toLowerCase()));

  private buildTagRecords(): void {
    if (isNil(this.tags)) {
      this.tagRecords$ = EMPTY;
    } else {
      this.tagRecords$ = of(
        Object.keys(this.tags)
          .sort((key1, key2) => key1.localeCompare(key2))
          .map(key => ({
            key: key,
            value: this.tags![key] as string | number,
          })),
      );
    }
  }
}
