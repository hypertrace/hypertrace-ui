import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { FilterAttribute } from '../filter-bar/filter-attribute';
import { Filter } from '../filter-bar/filter/filter-api';
import { IconSize } from '../icon/icon-size';
import { FilterButtonService } from './filter-button.service';

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
export class FilterButtonComponent<T = unknown> implements OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public attribute?: FilterAttribute;

  @Input()
  public value?: T;

  @Output()
  public readonly popoverOpen: EventEmitter<boolean> = new EventEmitter();

  public availableFilters: Filter[] = [];

  public constructor(private readonly filterButtonService: FilterButtonService) {}

  public ngOnChanges(): void {
    this.availableFilters =
      this.attribute !== undefined ? this.filterButtonService.buildAvailableFilters(this.attribute, this.value) : [];
  }

  public onFilterClick(filter: Filter): void {
    this.filterButtonService.applyUrlFilter(this.metadata || [], filter);
  }
}
