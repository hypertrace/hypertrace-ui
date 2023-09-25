import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { FilterValue } from '../filter/filter';
import { FilterAttributeExpression } from '../filter/parser/parsed-filter';

export const FILTER_BUTTON_WRAPPER = new InjectionToken<FilterButtonWrapperData>('INTERVAL_DATA');

@Component({
  selector: 'ht-filter-button-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-filter-button
      *ngIf="this.targetAttribute && this.value"
      [attribute]="this.targetAttribute.attribute"
      [value]="this.value"
      [subpath]="this.targetAttribute?.subpath"
    ></ht-filter-button>
  `
})
export class FilterButtonWrapperComponent {
  public targetAttribute: FilterAttributeExpression;
  public value: FilterValue;

  public constructor(@Inject(FILTER_BUTTON_WRAPPER) private readonly filterButtonWrapperData: FilterButtonWrapperData) {
    this.targetAttribute = this.filterButtonWrapperData.targetAttribute;
    this.value = this.filterButtonWrapperData.value;
  }
}

export interface FilterButtonWrapperData {
  targetAttribute: FilterAttributeExpression;
  value: FilterValue;
}
