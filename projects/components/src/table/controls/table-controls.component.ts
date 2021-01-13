import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SelectOption } from '../../select/select-option';
import { ToggleItem } from '../../toggle-group/toggle-item';
import { TableMode } from '../table-api';

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
          *ngFor="let selectFilter of this.selectMap | keyvalue"
          [placeholder]="selectFilter.value.placeholder"
          class="control select"
          (selectedChange)="this.onSelectChange(selectFilter.key, $event)"
        >
          <ht-select-option
            *ngFor="let option of selectFilter.value.options"
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
        *ngIf="this.modeToggleEnabled"
        class="control mode-toggle-group"
        [items]="this.modeItems"
        [activeItem]="this.activeModeItem"
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
  public selectMap?: Map<string, SelectFilter>;

  @Input()
  public filterItems?: ToggleItem[] = [];

  @Input()
  public activeFilterItem?: ToggleItem;

  @Input()
  public modeItems?: ToggleItem[] = [];

  @Input()
  public activeModeItem?: ToggleItem;

  // Checkbox filter
  @Input()
  public checkboxLabel?: string;

  @Input()
  public checkboxChecked?: boolean;

  @Output()
  public readonly selectChange: EventEmitter<KeyValue<string, unknown>> = new EventEmitter<KeyValue<string, unknown>>();

  @Output()
  public readonly checkboxCheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public readonly searchChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly filterChange: EventEmitter<ToggleItem> = new EventEmitter<ToggleItem>();

  @Output()
  public readonly modeChange: EventEmitter<TableMode> = new EventEmitter<TableMode>();

  public get modeToggleEnabled(): boolean {
    return !!this.modeItems && this.modeItems.length > 0;
  }

  public get checkboxEnabled(): boolean {
    return !isEmpty(this.checkboxLabel);
  }

  public get filterItemsEnabled(): boolean {
    return !!this.filterItems && this.filterItems.length > 0;
  }

  public get anyControlsEnabled(): boolean {
    return this.modeToggleEnabled || this.checkboxEnabled || this.filterItemsEnabled || !!this.searchEnabled;
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

    if (changes.modeItems) {
      this.setActiveModeItem();
    }
  }

  private setActiveFilterItem(): void {
    if (this.filterItems !== undefined) {
      this.activeFilterItem = this.filterItems.find(item => item === this.activeFilterItem) ?? this.filterItems[0];
    }
  }

  private setActiveModeItem(): void {
    if (this.modeItems !== undefined) {
      this.activeModeItem = this.modeItems.find(item => item === this.activeModeItem) ?? this.modeItems[0];
    }
  }

  public onSelectChange(key: string, value: unknown): void {
    this.selectChange.emit({ key: key, value: value });
  }

  public onFilterChange(item: ToggleItem): void {
    this.filterChange.emit(item);
  }

  public onSearchChange(text: string): void {
    this.searchDebounceSubject.next(text);
  }

  public onModeChange(item: ToggleItem<TableMode>): void {
    this.modeChange.emit(item.value);
  }
}

export interface SelectFilter {
  placeholder?: string;
  options: SelectOption<unknown>[];
}
