import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  IterableDiffer,
  IterableDiffers,
  OnChanges,
  Output,
  TemplateRef
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEqual } from 'lodash-es';
import { IconSize } from '../../icon/icon-size';
import { MultiSelectJustify } from '../../multi-select/multi-select-justify';
import { MultiSelectSearchMode, TriggerLabelDisplayMode } from '../../multi-select/multi-select.component';
import { ToggleItem } from '../../toggle-group/toggle-item';
import { StatefulTableRow } from '../table-api';
import {
  TableCheckboxChange,
  TableCheckboxControl,
  TableSelectChange,
  TableSelectControl,
  TableSelectControlOption
} from './table-controls-api';

@Component({
  selector: 'ht-table-controls',
  styleUrls: ['./table-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-controls" *ngIf="this.anyControlsEnabled">
      <!-- Left -->
      <div class="table-controls-left">
        <!-- Search -->
        <ht-search-box
          *ngIf="this.searchEnabled"
          class="control search-box"
          [placeholder]="this.searchPlaceholder || this.DEFAULT_SEARCH_PLACEHOLDER"
          [debounceTime]="400"
          (valueChange)="this.onSearchChange($event)"
        ></ht-search-box>

        <!-- Selects -->
        <ng-container *ngFor="let selectControl of this.selectControls">
          <ht-multi-select
            *ngIf="selectControl.isMultiSelect"
            [selected]="this.appliedFilters(selectControl)"
            [placeholder]="selectControl.placeholder"
            class="control select"
            showBorder="true"
            searchMode="${MultiSelectSearchMode.CaseInsensitive}"
            (selectedChange)="this.onMultiSelectChange(selectControl, $event)"
          >
            <ht-select-option
              *ngFor="let option of selectControl.options"
              [label]="option.label"
              [value]="option"
            ></ht-select-option>
          </ht-multi-select>

          <ht-select
            *ngIf="!selectControl.isMultiSelect"
            [selected]="this.appliedFilters(selectControl)"
            [placeholder]="selectControl.placeholder"
            class="control select"
            showBorder="true"
            searchMode="${MultiSelectSearchMode.CaseInsensitive}"
            (selectedChange)="this.onSelectChange(selectControl, $event)"
          >
            <ht-select-option
              *ngFor="let option of selectControl.options"
              [label]="option.label"
              [value]="option"
            ></ht-select-option>
          </ht-select>
        </ng-container>
      </div>

      <!-- Right -->
      <div class="table-controls-right">
        <!-- Checkbox Filters -->
        <ht-multi-select
          class="filter-multi-select"
          *ngIf="this.checkboxControlsEnabled"
          justify="${MultiSelectJustify.Center}"
          triggerLabelDisplayMode="${TriggerLabelDisplayMode.Icon}"
          icon="${IconType.Settings}"
          iconSize="${IconSize.Large}"
          [selected]="this.checkboxSelections"
          (selectedChange)="this.onCheckboxChange($event)"
        >
          <ht-select-option
            *ngFor="let checkboxControl of this.checkboxControls"
            [label]="checkboxControl.label"
            [value]="checkboxControl.label"
          >
          </ht-select-option>
        </ht-multi-select>

        <!-- Mode Toggle -->
        <ht-toggle-group
          *ngIf="this.viewToggleEnabled"
          class="control mode-toggle-group"
          [items]="this.viewItems"
          [activeItem]="this.activeViewItem"
          (activeItemChange)="this.onViewChange($event)"
        ></ht-toggle-group>

        <!-- Custom Control -->
        <ng-container *ngIf="this.customControlContent">
          <ng-container
            *ngTemplateOutlet="this.customControlContent; context: { selectedRows: this.selectedRows }"
          ></ng-container>
        </ng-container>
      </div>
    </div>
  `
})
export class TableControlsComponent implements OnChanges {
  public readonly DEFAULT_SEARCH_PLACEHOLDER: string = 'Search...';

  @Input()
  public searchEnabled?: boolean;

  @Input()
  public searchPlaceholder?: string;

  @Input()
  public selectControls?: TableSelectControl[] = [];

  @Input()
  public checkboxControls?: TableCheckboxControl[] = [];

  @Input()
  public activeFilterItem?: ToggleItem;

  @Input()
  public viewItems?: ToggleItem[] = [];

  @Input()
  public activeViewItem?: ToggleItem;

  @Input()
  public selectedRows?: StatefulTableRow[] = [];

  @Input()
  public customControlContent?: TemplateRef<{ selectedRows?: StatefulTableRow[] }>;

  @Output()
  public readonly searchChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly selectChange: EventEmitter<TableSelectChange> = new EventEmitter<TableSelectChange>();

  @Output()
  public readonly checkboxChange: EventEmitter<TableCheckboxChange> = new EventEmitter<TableCheckboxChange>();

  @Output()
  public readonly viewChange: EventEmitter<string> = new EventEmitter<string>();

  private readonly selectSelections: Map<TableSelectControl, TableSelectControlOption[]> = new Map<
    TableSelectControl,
    TableSelectControlOption[]
  >();

  public checkboxSelections: string[] = [];
  private readonly checkboxDiffer?: IterableDiffer<string>;

  public get viewToggleEnabled(): boolean {
    return !!this.viewItems && this.viewItems.length > 0;
  }

  public get selectControlsEnabled(): boolean {
    return !!this.selectControls && this.selectControls.length > 0;
  }

  public get checkboxControlsEnabled(): boolean {
    return !!this.checkboxControls && this.checkboxControls.length > 0;
  }

  public get anyControlsEnabled(): boolean {
    return !!this.searchEnabled || this.viewToggleEnabled || this.selectControlsEnabled || this.checkboxControlsEnabled;
  }

  public constructor(private readonly differFactory: IterableDiffers) {
    this.checkboxDiffer = this.differFactory.find([]).create();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.selectControls) {
      this.diffSelections();
    }

    if (changes.checkboxControls) {
      this.diffCheckboxes();
    }

    if (changes.viewItems) {
      this.setActiveViewItem();
    }
  }

  private diffSelections(): void {
    this.selectSelections.clear();
    this.selectControls?.forEach(selectControl => {
      this.selectSelections.set(
        selectControl,
        selectControl.options.filter(option => option.applied)
      );
    });
  }

  private diffCheckboxes(): void {
    this.checkboxSelections = this.checkboxControls
      ? this.checkboxControls.filter(control => control.value).map(control => control.label)
      : [];

    this.checkboxDiffer?.diff(this.checkboxSelections);
  }

  public appliedFilters(selectControl: TableSelectControl): TableSelectControlOption[] | undefined {
    return this.selectSelections.get(selectControl);
  }

  private setActiveViewItem(): void {
    if (this.viewItems !== undefined) {
      this.activeViewItem = this.findViewItem(this.activeViewItem);
    }
  }

  public onSearchChange(text: string): void {
    this.searchChange.emit(text);
  }

  public onMultiSelectChange(select: TableSelectControl, selections: TableSelectControlOption[]): void {
    this.selectChange.emit({
      select: select,
      values: selections
    });
  }

  public onSelectChange(select: TableSelectControl, selection: TableSelectControlOption): void {
    this.selectChange.emit({
      select: select,
      values: [selection]
    });
  }

  public onCheckboxChange(checked: string[]): void {
    const diff = this.checkboxDiffer?.diff(checked);
    if (!diff) {
      return;
    }

    diff.forEachAddedItem(addedItem => {
      const found: TableCheckboxControl | undefined = this.checkboxControls?.find(
        control => control.label === addedItem.item
      );
      if (found) {
        this.checkboxChange.emit({
          checkbox: found,
          option: found.options[0] // First index is always the true option
        });
      }
    });

    diff.forEachRemovedItem(removedItem => {
      const found: TableCheckboxControl | undefined = this.checkboxControls?.find(
        control => control.label === removedItem.item
      );
      if (found) {
        this.checkboxChange.emit({
          checkbox: found,
          option: found.options[1] // Second index is always the false option
        });
      }
    });

    this.checkboxSelections = checked;
    this.checkboxDiffer?.diff(this.checkboxSelections);
  }

  public onViewChange(item: ToggleItem<string>): void {
    this.viewChange.emit(item.value);
  }

  private findViewItem(viewItem?: ToggleItem): ToggleItem | undefined {
    return this.viewItems?.find(item => isEqual(item, viewItem)) ?? this.viewItems![0];
  }
}
