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
import { IconType } from '@hypertrace/assets-library';
import { LoggerService, queryListAndChanges$ } from '@hypertrace/common';
import { EMPTY, Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
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
            [ngClass]="this.triggerLabelDisplayMode"
            #triggerContainer
          >
            <ht-icon *ngIf="this.icon" [icon]="this.icon" [size]="this.iconSize"> </ht-icon>
            <div *ngIf="!this.isIconOnlyMode()" class="trigger-label-container">
              <ht-label class="trigger-label" [label]="this.triggerLabel"></ht-label>
              <ht-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></ht-icon>
            </div>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="multi-select-content" [ngStyle]="{ 'min-width.px': triggerContainer.offsetWidth }">
            <ng-container *ngIf="this.enableSearch">
              <ht-search-box
                class="search-bar"
                (valueChange)="this.searchOptions($event)"
                [debounceTime]="200"
                displayMode="${SearchBoxDisplayMode.NoBorder}"
              ></ht-search-box>
            </ng-container>
            <ht-divider *ngIf="this.enableSearch" class="divider"></ht-divider>

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
              *ngIf="!this.isAnyOptionSelected()"
              role="${ButtonRole.Primary}"
              display="${ButtonStyle.Text}"
              label="Select All"
              (click)="this.onSelectAll()"
            ></ht-button>

            <div
              *ngFor="let item of this.filteredOptions$ | async"
              (click)="this.onSelectionChange(item)"
              class="multi-select-option"
            >
              <input class="checkbox" type="checkbox" [checked]="this.isSelectedItem(item)" />
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
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class MultiSelectComponent<V> implements AfterContentInit, OnChanges {
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
  public disabled: boolean = false;

  @Input()
  public showBorder: boolean = false;

  @Input()
  public enableSearch: boolean = false;

  @Input()
  public justify: MultiSelectJustify = MultiSelectJustify.Left;

  @Input()
  /** @deprecated */
  public showAllOptionControl?: boolean = false;

  @Input()
  public triggerLabelDisplayMode: TriggerLabelDisplayMode = TriggerLabelDisplayMode.Selection;

  @Output()
  public readonly selectedChange: EventEmitter<V[]> = new EventEmitter<V[]>();

  @ContentChildren(SelectOptionComponent)
  private readonly allOptionsList?: QueryList<SelectOptionComponent<V>>;
  private allOptions$!: Observable<QueryList<SelectOptionComponent<V>>>;

  public filteredOptions$!: Observable<SelectOptionComponent<V>[]>;
  private readonly searchSubject: Subject<string> = new BehaviorSubject('');

  public popoverOpen: boolean = false;
  public triggerLabel?: string;

  public constructor(_loggerService: LoggerService) {}

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
    this.searchSubject.next(searchText);
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
    const selected = this.isSelectedItem(item)
      ? this.selected?.filter(value => value !== item.value)
      : (this.selected ?? []).concat(item.value);

    this.setSelection(selected ?? []);
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    return this.selected !== undefined && this.selected.filter(value => value === item.value).length > 0;
  }

  private setSelection(selected: V[]): void {
    this.selected = selected;
    this.setTriggerLabel();
    this.selectedChange.emit(this.selected);
  }

  private setTriggerLabel(): void {
    if (this.triggerLabelDisplayMode === TriggerLabelDisplayMode.Placeholder) {
      this.triggerLabel = this.placeholder;

      return;
    }

    const selectedItems: SelectOptionComponent<V>[] | undefined = this.allOptionsList?.filter(item =>
      this.isSelectedItem(item)
    );
    if (selectedItems === undefined || selectedItems.length === 0) {
      this.triggerLabel = this.placeholder;
    } else if (selectedItems.length === 1) {
      this.triggerLabel = selectedItems[0].label;
    } else {
      this.triggerLabel = `${selectedItems[0].label} and ${selectedItems.length - 1} more`;
    }
  }
}

export const enum TriggerLabelDisplayMode {
  // These may be used as css classes
  Placeholder = 'placeholder-mode',
  Selection = 'selection-mode',
  Icon = 'icon-mode'
}
