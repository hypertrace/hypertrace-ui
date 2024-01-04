import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { FilterValue } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';

export const FILTER_BUTTON_WRAPPER = new InjectionToken<FilterButtonWrapperData>('INTERVAL_DATA');

@Component({
  selector: 'ht-filter-button-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-filter-button
      *ngIf="this.filterButtonWrapperData"
      [attribute]="this.targetAttribute"
      [metadata]="this.metadata"
      [value]="this.value"
      [subpath]="this.targetAttributeSubpath"
    ></ht-filter-button>
  `,
})
export class FilterButtonWrapperComponent {
  public targetAttribute: FilterAttribute;
  public targetAttributeSubpath?: string;
  public metadata: FilterAttribute[];
  public value: FilterValue;

  public constructor(@Inject(FILTER_BUTTON_WRAPPER) public readonly filterButtonWrapperData: FilterButtonWrapperData) {
    this.targetAttribute = filterButtonWrapperData.targetAttribute;
    this.targetAttributeSubpath = filterButtonWrapperData.targetAttributeSubpath;
    this.metadata = filterButtonWrapperData.metadata;
    this.value = filterButtonWrapperData.value;
  }
}

export interface FilterButtonWrapperData {
  targetAttribute: FilterAttribute;
  targetAttributeSubpath: string;
  metadata: FilterAttribute[];
  value: FilterValue;
}
