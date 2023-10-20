import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';
import { IconSize } from '../../icon/icon-size';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { Filter, FilterValue } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterUrlService } from '../filter/filter-url.service';
import { FilterOperator } from '../filter/filter-operators';

@Component({
  selector: 'ht-filter-button',
  styleUrls: ['./filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-button">
      <ht-popover
        [closeOnClick]="true"
        (popoverOpen)="this.popoverOpen.emit(true)"
        (popoverClose)="this.popoverOpen.emit(false)"
      >
        <ht-popover-trigger>
          <div #trigger>
            <ht-icon icon="${IconType.Filter}" size="${IconSize.Small}"></ht-icon>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div [style.min-width.px]="trigger.offsetWidth" class="popover-content">
            <div
              *ngFor="let availableFilter of this.availableFilters"
              (click)="this.onFilterClick(availableFilter)"
              class="popover-item"
            >
              <div>{{ availableFilter.userString }}</div>
            </div>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class FilterButtonComponent implements OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public attribute?: FilterAttribute;

  @Input()
  public value?: FilterValue;

  @Input()
  public subpath?: string;

  @Output()
  public readonly popoverOpen: EventEmitter<boolean> = new EventEmitter();

  private static readonly DEFAULT_VALUE: string = 'null';
  public availableFilters: Filter[] = [];

  public constructor(
    private readonly filterUrlService: FilterUrlService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {}

  public ngOnChanges(): void {
    if (isNil(this.attribute)) {
      this.availableFilters = [];
    } else if (isNil(this.value)) {
      this.availableFilters = this.buildSimplifiedFilters(this.attribute);
    } else {
      this.availableFilters = this.buildAvailableFilters(this.attribute, this.value, this.subpath);
    }
  }

  public onFilterClick(filter: Filter): void {
    this.filterUrlService.addUrlFilter(this.metadata || [], filter);
  }

  private buildAvailableFilters(attribute: FilterAttribute, value: FilterValue, subpath?: string): Filter[] {
    return this.filterBuilderLookupService
      .lookup(attribute.type)
      .buildFiltersForSupportedOperators(attribute, value, subpath);
  }

  private buildSimplifiedFilters(attribute: FilterAttribute, value?: FilterValue): Filter[] {
    return [
      this.filterBuilderLookupService
        .lookup(attribute.type)
        .buildFilter(attribute, FilterOperator.Equals, value ?? FilterButtonComponent.DEFAULT_VALUE),
      this.filterBuilderLookupService
        .lookup(attribute.type)
        .buildFilter(attribute, FilterOperator.NotEquals, value ?? FilterButtonComponent.DEFAULT_VALUE),
      this.filterBuilderLookupService
        .lookup(attribute.type)
        .buildFilter(attribute, FilterOperator.In, value ?? FilterButtonComponent.DEFAULT_VALUE),
      this.filterBuilderLookupService
        .lookup(attribute.type)
        .buildFilter(attribute, FilterOperator.NotIn, value ?? FilterButtonComponent.DEFAULT_VALUE)
    ];
  }
}
