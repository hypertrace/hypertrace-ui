import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { queryListAndChanges$, SubscriptionLifecycle } from '@hypertrace/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonRole, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { SearchBoxDisplayMode } from '../search-box/search-box.component';
import { SelectOptionComponent } from '../select/select-option.component';
import { SelectSize } from '../select/select-size';
import { MultiSelectJustify } from './multi-select-justify';
@Component({
  selector: 'ht-multi-select',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    SubscriptionLifecycle,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MultiSelectComponent,
      multi: true
    }
  ],
  template: `
    <div
      class="multi-select"
      [ngClass]="[
        this.size,
        this.showBorder ? 'border' : '',
        this.disabled ? 'disabled' : '',
        this.popoverOpen ? 'open' : ''
      ]"
    >
      <ht-popover
        [disabled]="this.disabled"
        class="multi-select-container"
        (popoverOpen)="this.popoverOpen = true"
        (popoverClose)="this.popoverOpen = false"
      >
        <ht-popover-trigger>
          <div
            class="trigger-content"
            [style.justify-content]="this.justify"
            [ngClass]="[this.triggerLabelDisplayMode, this.popoverOpen ? 'open' : '']"
            #triggerContainer
          >
            <ht-icon *ngIf="this.icon" [icon]="this.icon" [size]="this.iconSize"></ht-icon>
            <ng-container *ngIf="!this.isIconOnlyMode()">
              <div class="trigger-label-container" *ngIf="this.triggerValues$ | async as triggerValues">
                <ht-label class="trigger-label" [label]="triggerValues.label"></ht-label>
                <span *ngIf="triggerValues.selectedItemsCount > 1" class="trigger-more-items"
                  >+{{ triggerValues.selectedItemsCount - 1 }}</span
                >
                <ht-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></ht-icon>
              </div>
            </ng-container>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="multi-select-content" [ngStyle]="{ 'min-width.px': triggerContainer.offsetWidth, 'max-height.px': this.maxHeight }">
            <ng-container *ngIf="this.searchMode !== '${MultiSelectSearchMode.Disabled}'">
              <ng-container *ngIf="this.allOptions$ | async as allOptions">
                <ht-search-box
                  class="search-bar"
                  (valueChange)="this.searchOptions($event)"
                  [debounceTime]="200"
                  displayMode="${SearchBoxDisplayMode.NoBorder}"
                ></ht-search-box>
                <ht-divider class="divider"></ht-divider>

                <ht-button
                  class="clear-selected"
                  *ngIf="this.isAnyOptionSelected()"
                  role="${ButtonRole.Primary}"
                  display="${ButtonStyle.Text}"
                  label="Clear Selected"
                  (click)="this.onClearSelected()"
                ></ht-button>

                <ht-button
                  class="select-all"
                  *ngIf="allOptions.length > 0 && !this.isAnyOptionSelected()"
                  role="${ButtonRole.Primary}"
                  display="${ButtonStyle.Text}"
                  label="Select All"
                  (click)="this.onSelectAll()"
                ></ht-button>
              </ng-container>
            </ng-container>

            <div class="multi-select-options" *htLoadAsync="this.filteredOptions$ as filteredOptions">
              <div
                *ngFor="let item of filteredOptions"
                (click)="this.onSelectionChange(item)"
                class="multi-select-option"
                [ngClass]="{ disabled: item.disabled }"
              >
                <ht-checkbox
                  class="checkbox"
                  (click)="this.preventClickDefault($event)"
                  [checked]="this.isSelectedItem(item)"
                  [disabled]="item.disabled"
                ></ht-checkbox>
                <ht-icon
                  class="icon"
                  *ngIf="item.icon"
                  [icon]="item.icon"
                  size="${IconSize.ExtraSmall}"
                  [color]="item.iconColor"
                ></ht-icon>
                <span class="label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class MultiSelectComponent<V> implements ControlValueAccessor, AfterContentInit, OnChanges {
  @Input()
  public size: SelectSize = SelectSize.Medium;

  @Input()
  public selected?: V[];

  @Input()
  public icon?: string;

  @Input()
  public iconSize: IconSize = IconSize.Small;

  @Input()
  public placeholder?: string;

  @Input()
  public prefix?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public showBorder: boolean = false;

  @Input()
  public searchMode: MultiSelectSearchMode = MultiSelectSearchMode.Disabled;

  @Input()
  public justify: MultiSelectJustify = MultiSelectJustify.Left;

  @Input()
  public triggerLabelDisplayMode: TriggerLabelDisplayMode = TriggerLabelDisplayMode.Selection;

  @Input()
  public maxHeight: number = 360;

  @Output()
  public readonly selectedChange: EventEmitter<V[]> = new EventEmitter<V[]>();

  @Output()
  public readonly searchValueChange: EventEmitter<string> = new EventEmitter<string>();

  @ContentChildren(SelectOptionComponent)
  private readonly allOptionsList?: QueryList<SelectOptionComponent<V>>;
  public allOptions$!: Observable<QueryList<SelectOptionComponent<V>>>;

  public filteredOptions$!: Observable<SelectOptionComponent<V>[]>;
  private readonly searchSubject: Subject<string> = new BehaviorSubject('');

  public popoverOpen: boolean = false;
  public triggerValues$: Observable<TriggerValues> = new Observable();

  private propagateControlValueChange?: (value: V[] | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: V[] | undefined) => void;

  public ngAfterContentInit(): void {
    this.allOptions$ = this.allOptionsList !== undefined ? queryListAndChanges$(this.allOptionsList) : EMPTY;
    this.filteredOptions$ = combineLatest([this.allOptions$, this.searchSubject]).pipe(
      map(([options, searchText]) =>
        options.filter(option => option.label.toLowerCase().includes(searchText.toLowerCase()))
      )
    );
    this.setTriggerLabel();
  }

  public ngOnChanges(): void {
    this.setTriggerLabel();
  }

  public searchOptions(searchText: string): void {
    if (this.searchMode === MultiSelectSearchMode.Disabled) {
      return;
    }

    if (this.searchMode === MultiSelectSearchMode.CaseInsensitive) {
      this.searchSubject.next(searchText);
    }

    this.searchValueChange.emit(searchText);
  }

  public onSelectAll(): void {
    this.setSelection(this.allOptionsList!.map(item => item.value));
  }

  public onClearSelected(): void {
    this.setSelection([]);
  }

  public isIconOnlyMode(): boolean {
    return this.triggerLabelDisplayMode === TriggerLabelDisplayMode.Icon;
  }

  public isAnyOptionSelected(): boolean {
    return this.selected !== undefined && this.allOptionsList !== undefined && this.selected.length > 0;
  }

  public onSelectionChange(item: SelectOptionComponent<V>): void {
    if (item.disabled) {
      return;
    }

    const selected = this.isSelectedItem(item)
      ? this.selected?.filter(value => !isEqual(value, item.value))
      : (this.selected ?? []).concat(item.value);

    this.setSelection(selected ?? []);
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    return this.selected !== undefined && this.selected.filter(value => isEqual(value, item.value)).length > 0;
  }

  public preventClickDefault(event: Event): void {
    event.preventDefault();
  }

  public writeValue(value?: V[]): void {
    this.setSelection(value ?? []);
  }

  public registerOnChange(onChange: (value: V[] | undefined) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value: V[] | undefined) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  private setSelection(selected: V[]): void {
    this.selected = selected;
    this.setTriggerLabel();
    this.selectedChange.emit(this.selected);
    this.propagateValueChangeToFormControl(this.selected);
  }

  private setTriggerLabel(): void {
    if (this.triggerLabelDisplayMode === TriggerLabelDisplayMode.Placeholder) {
      this.triggerValues$ = of({
        label: this.placeholder,
        selectedItemsCount: 0
      });

      return;
    }

    this.triggerValues$ = this.allOptions$?.pipe(
      map(options => {
        const selectedItems: SelectOptionComponent<V>[] = options.filter(item => this.isSelectedItem(item));

        return {
          label: this.getLabel(selectedItems),
          selectedItemsCount: selectedItems.length
        };
      })
    );
  }

  private getLabel(selectedItems: SelectOptionComponent<V>[]): string {
    if (selectedItems.length === 0) {
      return this.placeholder === undefined ? '' : this.placeholder;
    }

    return this.prefix === undefined ? selectedItems[0]?.label : `${this.prefix}${selectedItems[0]?.label}`.trim();
  }

  private propagateValueChangeToFormControl(value: V[] | undefined): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }
}

interface TriggerValues {
  label: string | undefined;
  selectedItemsCount: number;
}

export const enum TriggerLabelDisplayMode {
  // These may be used as css classes
  Placeholder = 'placeholder-mode',
  Selection = 'selection-mode',
  Icon = 'icon-mode'
}

export const enum MultiSelectSearchMode {
  Disabled = 'disabled', // Search is not available
  CaseInsensitive = 'case-insensitive', // Current available values are filtered in a case insensitive way and an emit is triggered
  EmitOnly = 'emit-only' // Current available values not filtered, but an emit still triggered
}
