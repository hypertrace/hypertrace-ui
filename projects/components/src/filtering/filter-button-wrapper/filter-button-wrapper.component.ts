import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { FilterValue } from '../filter/filter';
import { FilterAttributeExpression } from '../filter/parser/parsed-filter';

export const FILTER_BUTTON_WRAPPER = new InjectionToken<FilterButtonWrapperData>('INTERVAL_DATA');

@Component({
  selector: 'ht-filter-button-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-filter-button
      *ngIf="this.filterButtonWrapperData"
      [attribute]="this.filterButtonWrapperData.targetAttribute.attribute"
      [value]="this.filterButtonWrapperData.value"
      [subpath]="this.filterButtonWrapperData.targetAttribute.subpath"
    ></ht-filter-button>
  `
})
export class FilterButtonWrapperComponent {
  public constructor(@Inject(FILTER_BUTTON_WRAPPER) public readonly filterButtonWrapperData: FilterButtonWrapperData) {}
}

export interface FilterButtonWrapperData {
  targetAttribute: FilterAttributeExpression;
  value: FilterValue;
}
