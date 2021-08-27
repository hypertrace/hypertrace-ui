import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationParamsType, NavigationService } from '@hypertrace/common';
import { StringMapFilterBuilder } from '../filtering/filter/builder/types/string-map-filter-builder';
import { FilterOperator } from '../filtering/filter/filter-operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-list-view',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-view">
      <div *ngIf="this.header" class="header-row">
        <div class="header-key-label">
          <span>{{ this.header.keyLabel }}</span>
        </div>
        <div class="header-value-label">
          <span>{{ this.header.valueLabel }}</span>
        </div>
      </div>
      <div class="data-row" *ngFor="let record of this.records">
        <div class="key">
          <span>{{ record.key }}</span>
        </div>
        <div class="value">
          <span>{{ record.value }}</span>
        </div>
        <div *ngIf="this.actionType" class="action-item">
          <ht-icon
            *ngIf="this.actionType === '${ListViewActionType.AttributeSearch}'"
            class="attribute-search icon"
            icon="${IconType.ChevronRight}"
            size="${IconSize.Small}"
            htTooltip="Search in Explorer"
            (click)="this.searchAttributes(record.key, record.value)"
          ></ht-icon>
        </div>
      </div>
    </div>
  `
})
export class ListViewComponent {
  @Input()
  public header?: ListViewHeader;

  @Input()
  public records?: ListViewRecord[];

  @Input()
  public actionType?: ListViewActionType;

  private readonly scopeQueryParam: string = 'endpoint-traces';
  private readonly filterBuilder: StringMapFilterBuilder = new StringMapFilterBuilder();

  public constructor(private readonly navigationService: NavigationService) {}

  public searchAttributes(key: string, value: string): void {
    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: '/explorer',
      queryParams: {
        scope: this.scopeQueryParam,
        filter: this.filterBuilder.buildEncodedUrlFilterString('tags', FilterOperator.ContainsKeyValue, [key, value])
      }
    });
  }
}

export interface ListViewHeader {
  keyLabel: string;
  valueLabel: string;
}

export interface ListViewRecord {
  key: string;
  value: string | number;
}

export const enum ListViewActionType {
  AttributeSearch = 'attribute-search'
}
