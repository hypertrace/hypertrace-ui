import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { sortUnknown, TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '../../icon/icon-size';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterOperator } from '../filter/filter-operators';
import { FilterUrlService } from '../filter/filter-url.service';
import { FilterParserLookupService } from '../filter/parser/filter-parser-lookup.service';

@Component({
  selector: 'ht-in-filter-button',
  styleUrls: ['./in-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-button" *ngIf="this.isSupported">
      <ht-popover [closeOnClick]="false" (popoverOpen)="this.onPopoverOpen()" (popoverClose)="this.onPopoverClose()">
        <ht-popover-trigger>
          <div #trigger>
            <ht-icon icon="${IconType.Filter}" size="${IconSize.Small}"></ht-icon>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div [style.min-width.px]="trigger.offsetWidth" class="popover-content">
            <div *ngFor="let availableValue of this.values" class="popover-item">
              <ht-checkbox
                [label]="availableValue"
                [checked]="this.selected.has(availableValue)"
                (checkedChange)="this.onChecked($event, availableValue)"
              ></ht-checkbox>
            </div>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class InFilterButtonComponent implements OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public attribute?: FilterAttribute;

  @Input()
  public values?: unknown[];

  @Output()
  public readonly popoverOpen: EventEmitter<boolean> = new EventEmitter();

  public isSupported: boolean = false;
  public selected: Set<unknown> = new Set<unknown>();

  public constructor(
    private readonly filterUrlService: FilterUrlService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly filterParserLookupService: FilterParserLookupService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.attribute) {
      this.isSupported = this.attribute
        ? this.filterParserLookupService.isParsableOperatorForType(FilterOperator.In, this.attribute.type)
        : false;
    }
  }

  public onPopoverOpen(): void {
    if (this.attribute === undefined || this.metadata === undefined) {
      return;
    }

    this.selected.clear();

    this.filterUrlService.getUrlFilters([this.attribute]).forEach(filter => {
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

    const filter = this.filterBuilderLookupService
      .lookup(this.attribute.type)
      .buildFilter(this.attribute, FilterOperator.In, [...this.selected.values()].sort(sortUnknown));

    if (this.selected.size > 0) {
      this.filterUrlService.applyUrlFilter(this.metadata, filter);
    } else {
      this.filterUrlService.removeUrlFilter(this.metadata, filter);
    }
  }

  public onChecked(checked: boolean, value: unknown): void {
    checked ? this.selected.add(value) : this.selected.delete(value);
  }
}
