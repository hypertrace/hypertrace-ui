import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToggleItem } from '../../toggle-group/toggle-item';
import { SelectChange, SelectFilter } from './table-controls-api';

@Component({
  selector: 'ht-table-controls',
  styleUrls: ['./table-controls.component.scss'],
  providers: [SubscriptionLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-controls" *ngIf="this.anyControlsEnabled">
      <!-- Filters -->
      <div class="filter-controls">
        <!-- Search -->
        <ht-search-box
          *ngIf="this.searchEnabled"
          class="control search-box"
          [placeholder]="this.searchPlaceholder"
          (valueChange)="this.onSearchChange($event)"
        ></ht-search-box>

        <!-- Selects -->
        <ht-select
          *ngFor="let selectFilterItem of this.selectFilterItems"
          [placeholder]="selectFilterItem.placeholder"
          class="control select"
          (selectedChange)="this.onSelectChange(selectFilterItem, $event)"
        >
          <ht-select-option
            *ngFor="let option of selectFilterItem.options"
            [label]="option.label"
            [value]="option.value"
          ></ht-select-option>
        </ht-select>

        <!-- Filter Toggle -->
        <ht-toggle-group
          *ngIf="this.filterItemsEnabled"
          class="control filter-toggle-group"
          [items]="this.filterItems"
          [activeItem]="this.activeFilterItem"
          (activeItemChange)="this.onFilterChange($event)"
        ></ht-toggle-group>

        <!-- Checkbox Filter -->
        <ht-checkbox
          *ngIf="this.checkboxEnabled"
          class="control filter-checkbox"
          [label]="this.checkboxLabel"
          [checked]="this.checkboxChecked"
          (checkedChange)="this.checkboxCheckedChange.emit($event)"
        ></ht-checkbox>
      </div>

      <!-- Mode Toggle -->
      <ht-toggle-group
        *ngIf="this.viewToggleEnabled"
        class="control mode-toggle-group"
        [items]="this.viewItems"
        [activeItem]="this.activeViewItem"
        (activeItemChange)="this.onModeChange($event)"
      ></ht-toggle-group>
    </div>
  `
})
export class TableControlsComponent implements OnChanges {
  @Input()
  public searchEnabled?: boolean;

  @Input()
  public searchPlaceholder?: string = 'Search...';

  @Input()
  public selectFilterItems?: SelectFilter[] = [];

  @Input()
  public filterItems?: ToggleItem[] = [];

  @Input()
  public activeFilterItem?: ToggleItem;

  @Input()
  public viewItems?: ToggleItem[] = [];

  @Input()
  public activeViewItem?: ToggleItem;

  // Checkbox filter
  @Input()
  public checkboxLabel?: string;

  @Input()
  public checkboxChecked?: boolean;

  @Output()
  public readonly selectChange: EventEmitter<SelectChange> = new EventEmitter<SelectChange>();

  @Output()
  public readonly checkboxCheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public readonly searchChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly filterChange: EventEmitter<ToggleItem> = new EventEmitter<ToggleItem>();

  @Output()
  public readonly viewChange: EventEmitter<string> = new EventEmitter<string>();

  public get viewToggleEnabled(): boolean {
    return !!this.viewItems && this.viewItems.length > 0;
  }

  public get checkboxEnabled(): boolean {
    return !isEmpty(this.checkboxLabel);
  }

  public get filterItemsEnabled(): boolean {
    return !!this.filterItems && this.filterItems.length > 0;
  }

  public get anyControlsEnabled(): boolean {
    return this.viewToggleEnabled || this.checkboxEnabled || this.filterItemsEnabled || !!this.searchEnabled;
  }

  private readonly searchDebounceSubject: Subject<string> = new Subject<string>();

  public constructor(private readonly subscriptionLifecycle: SubscriptionLifecycle) {
    this.subscriptionLifecycle.add(
      this.searchDebounceSubject.pipe(debounceTime(200)).subscribe(text => this.searchChange.emit(text))
    );
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.filterItems) {
      this.setActiveFilterItem();
    }

    if (changes.viewItems) {
      this.setActiveViewItem();
    }
  }

  private setActiveFilterItem(): void {
    if (this.filterItems !== undefined) {
      this.activeFilterItem = this.filterItems.find(item => item === this.activeFilterItem) ?? this.filterItems[0];
    }
  }

  private setActiveViewItem(): void {
    if (this.viewItems !== undefined) {
      this.activeViewItem = this.viewItems.find(item => item === this.activeViewItem) ?? this.viewItems[0];
    }
  }

  public onSelectChange(select: SelectFilter, keyValue: KeyValue<string, unknown>): void {
    this.selectChange.emit({
      select: select,
      value: keyValue
    });
  }

  public onFilterChange(item: ToggleItem): void {
    this.filterChange.emit(item);
  }

  public onSearchChange(text: string): void {
    this.searchDebounceSubject.next(text);
  }

  public onModeChange(item: ToggleItem<string>): void {
    this.viewChange.emit(item.value);
  }
}
