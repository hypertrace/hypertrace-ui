import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { Filter } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterUrlService } from '../filter/filter-url.service';

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
  public value?: unknown;

  @Output()
  public readonly popoverOpen: EventEmitter<boolean> = new EventEmitter();

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
    this.filterUrlService.applyUrlFilter(this.metadata || [], filter);
  }
}
