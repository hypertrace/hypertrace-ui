import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToggleItem } from '../../toggle-group/toggle-item';
import { TableMode } from '../table-api';

@Component({
  selector: 'ht-table-controls',
  styleUrls: ['./table-controls.component.scss'],
  providers: [SubscriptionLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-controls">
      <!-- Filters -->
      <div class="filter-controls">
        <!-- Search -->
        <ht-search-box
          *ngIf="this.searchEnabled"
          class="control search-box"
          [placeholder]="this.searchPlaceholder"
          (valueChange)="this.onSearchChange($event)"
        ></ht-search-box>

        <!-- Filter Toggle -->
        <ht-toggle-group
          *ngIf="this.filterItems?.length > 1"
          class="control filter-toggle-group"
          [items]="this.filterItems"
          [activeItem]="this.activeFilterItem"
          (activeItemChange)="this.onFilterChange($event)"
        ></ht-toggle-group>
      </div>

      <!-- Mode Toggle -->
      <ht-toggle-group
        *ngIf="this.modeItems?.length > 1"
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
  public filterItems?: ToggleItem[] = [];

  @Input()
  public activeFilterItem?: ToggleItem;

  @Input()
  public modeItems?: ToggleItem[] = [];

  @Input()
  public activeModeItem?: ToggleItem;

  @Output()
  public readonly searchChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly filterChange: EventEmitter<ToggleItem> = new EventEmitter<ToggleItem>();

  @Output()
  public readonly modeChange: EventEmitter<TableMode> = new EventEmitter<TableMode>();

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
