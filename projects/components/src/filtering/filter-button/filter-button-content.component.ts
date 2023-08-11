import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { Filter, FilterValue } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterUrlService } from '../filter/filter-url.service';

@Component({
  selector: 'ht-filter-button-content',
  styleUrls: ['./filter-button-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngFor="let availableFilter of this.availableFilters"
      (click)="this.onFilterClick(availableFilter)"
      class="popover-item"
    >
      <div>{{ availableFilter.userString }}</div>
    </div>
  `
})
export class FilterButtonContentComponent implements OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public attribute?: FilterAttribute;

  @Input()
  public value?: FilterValue;

  public availableFilters: Filter[] = [];

  public constructor(
    private readonly filterUrlService: FilterUrlService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {}

  public ngOnChanges(): void {
    this.availableFilters =
      this.attribute !== undefined && this.value !== undefined
        ? this.filterBuilderLookupService
            .lookup(this.attribute.type)
            .buildFiltersForSupportedOperators(this.attribute, this.value)
        : [];
  }

  public onFilterClick(filter: Filter): void {
    this.filterUrlService.addUrlFilter(this.metadata || [], filter);
  }
}
