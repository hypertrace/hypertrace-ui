import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { sortUnknown, TypedSimpleChanges } from '@hypertrace/common';
import { FilterAttribute } from '../filter-bar/filter-attribute';
import { UserFilterOperator } from '../filter-bar/filter/filter-api';
import { IconSize } from '../icon/icon-size';
import { FilterButtonService } from './filter-button.service';

@Component({
  selector: 'htc-in-filter-button',
  styleUrls: ['./in-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-button" *ngIf="this.isSupported">
      <htc-popover [closeOnClick]="false" (popoverOpen)="this.onPopoverOpen()" (popoverClose)="this.onPopoverClose()">
        <htc-popover-trigger>
          <div #trigger>
            <htc-icon icon="${IconType.Filter}" size="${IconSize.Small}"></htc-icon>
          </div>
        </htc-popover-trigger>
        <htc-popover-content>
          <div [style.min-width.px]="trigger.offsetWidth" class="popover-content">
            <div *ngFor="let availableValue of this.values" class="popover-item">
              <htc-checkbox
                [label]="availableValue"
                [checked]="this.selected.has(availableValue)"
                (checkedChange)="this.onChecked($event, availableValue)"
              ></htc-checkbox>
            </div>
          </div>
        </htc-popover-content>
      </htc-popover>
    </div>
  `
})
export class InFilterButtonComponent<T = unknown> implements OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public attribute?: FilterAttribute;

  @Input()
  public values?: T[];

  @Output()
  public readonly popoverOpen: EventEmitter<boolean> = new EventEmitter();

  public isSupported: boolean = false;
  public selected: Set<T> = new Set<T>();

  public constructor(private readonly filterButtonService: FilterButtonService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.attribute) {
      this.isSupported = this.attribute
        ? this.filterButtonService.isSupportedOperator(this.attribute, UserFilterOperator.In)
        : false;
    }
  }

  public onPopoverOpen(): void {
    if (this.attribute === undefined || this.metadata === undefined) {
      return;
    }

    this.selected.clear();

    this.filterButtonService
      .getUrlFilters<T>([this.attribute])
      .forEach(filter => {
        if (filter.value instanceof Array) {
          filter.value.forEach(value => this.selected.add(value));
        } else {
          this.selected.add(filter.value);
        }
      });
  }

  public onPopoverClose(): void {
    if (this.attribute === undefined || this.metadata === undefined) {
      return;
    }

    const filter = this.filterButtonService.buildFilter(this.attribute, [...this.selected.values()].sort(sortUnknown));

    if (this.selected.size > 0) {
      this.filterButtonService.applyUrlFilter(this.metadata, filter);
    } else {
      this.filterButtonService.removeUrlFilter(this.metadata, filter);
    }
  }

  public onChecked(checked: boolean, value: T): void {
    checked ? this.selected.add(value) : this.selected.delete(value);
  }
}
