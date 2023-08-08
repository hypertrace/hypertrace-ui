import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { FilterAttribute, FilterValue } from '@hypertrace/components';

export const FILTER_BUTTON_CONTENT_DATA = new InjectionToken<FilterButtonContentData>('INTERVAL_DATA');

@Component({
  selector: 'ht-filter-button-content-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-filter-button
      *ngIf="this.filterButtonContentData"
      [metadata]="this.filterButtonContentData.metadata"
      [attribute]="this.filterButtonContentData.attribute"
      [value]="this.filterButtonContentData.value"
    ></ht-filter-button>
  `
})
export class FilterButtonWrapperComponent {
  public constructor(
    @Inject(FILTER_BUTTON_CONTENT_DATA) public readonly filterButtonContentData: FilterButtonContentData
  ) {}
}

export interface FilterButtonContentData {
  metadata?: FilterAttribute[],
  attribute?: FilterAttribute,
  value?: FilterValue
}