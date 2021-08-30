import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, TypedSimpleChanges } from '@hypertrace/common';
import { ListViewActionType, ListViewRecord } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'ht-span-tags-detail',
  styleUrls: ['./span-tags-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tags-details">
      <ng-container *htLoadAsync="this.tagRecords$ as tagRecords">
        <ht-list-view
          [records]="tagRecords"
          actionType="${ListViewActionType.AttributeSearch}"
          data-sensitive-pii
        ></ht-list-view>
      </ng-container>
    </div>
  `
})
export class SpanTagsDetailComponent implements OnChanges {
  @Input()
  public tags?: Dictionary<unknown>;

  public tagRecords$?: Observable<ListViewRecord[]>;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.tags && this.tags) {
      this.buildTagRecords();
    }
  }

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
