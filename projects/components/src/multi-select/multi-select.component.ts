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
import { LoggerService, queryListAndChanges$, TypedSimpleChanges } from '@hypertrace/common';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { SelectJustify } from '../select/select-justify';
import { SelectOption } from '../select/select-option';
import { SelectOptionComponent } from '../select/select-option.component';
import { SelectSize } from '../select/select-size';

@Component({
  selector: 'ht-multi-select',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="multi-select"
      [ngClass]="[this.size, this.showBorder ? 'border' : '', this.disabled ? 'disabled' : '']"
      *htLetAsync="this.selected$ as selected"
    >
      <ht-popover [disabled]="this.disabled" class="multi-select-container">
        <ht-popover-trigger>
          <div class="trigger-content" [ngClass]="this.justifyClass">
            <ht-icon *ngIf="this.icon" class="trigger-prefix-icon" [icon]="this.icon" size="${IconSize.Small}">
            </ht-icon>
            <ht-label class="trigger-label" [label]="this.triggerLabel"></ht-label>
            <ht-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.Small}"></ht-icon>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="multi-select-content">
            <ng-container *ngIf="this.showAllOptionControl">
              <div class="multi-select-option all-options" (click)="this.onAllSelectionChange()">
                <input class="checkbox" type="checkbox" [checked]="this.areAllOptionsSelected()" />
                <span class="label">All</span>
              </div>

              <ht-divider></ht-divider>
            </ng-container>

            <div *ngFor="let item of items" (click)="this.onSelectionChange(item)" class="multi-select-option">
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
  public placeholder?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public showBorder: boolean = false;

  @Input()
  public justify?: SelectJustify;

  @Input()
  public showAllOptionControl?: boolean = false;

  @Input()
  public triggerLabelDisplayMode: TriggerLabelDisplayMode = TriggerLabelDisplayMode.Selection;

  @Output()
  public readonly selectedChange: EventEmitter<V[]> = new EventEmitter<V[]>();

  @ContentChildren(SelectOptionComponent)
  public items?: QueryList<SelectOptionComponent<V>>;

  public selected$?: Observable<SelectOption<V>[] | undefined>;
  public triggerLabel?: string;

  public get justifyClass(): string {
    if (this.justify !== undefined) {
      return this.justify;
    }

    return this.showBorder ? SelectJustify.Left : SelectJustify.Right;
  }

  public constructor(private readonly loggerService: LoggerService) {}

  public ngAfterContentInit(): void {
    this.selected$ = this.buildObservableOfSelected();
    this.setTriggerLabel();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (this.items !== undefined && changes.selected !== undefined) {
      this.selected$ = this.buildObservableOfSelected();
    }
    this.setTriggerLabel();
  }

  public onAllSelectionChange(): void {
    this.selected = this.areAllOptionsSelected() ? [] : this.items!.map(item => item.value); // Select All or none
    this.setSelection();
  }

  public areAllOptionsSelected(): boolean {
    return this.selected !== undefined && this.items !== undefined && this.selected.length === this.items.length;
  }

  public onSelectionChange(item: SelectOptionComponent<V>): void {
    this.selected = this.isSelectedItem(item)
      ? this.selected?.filter(value => value !== item.value)
      : (this.selected ?? []).concat(item.value);

    this.setSelection();
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    return this.selected !== undefined && this.selected.filter(value => value === item.value).length > 0;
  }

  private setSelection(): void {
    this.setTriggerLabel();
    this.selected$ = this.buildObservableOfSelected();
    this.selectedChange.emit(this.selected);
  }

  private setTriggerLabel(): void {
    if (this.triggerLabelDisplayMode === TriggerLabelDisplayMode.Placeholder) {
      this.triggerLabel = this.placeholder;

      return;
    }

    const selectedItems: SelectOptionComponent<V>[] | undefined = this.items?.filter(item => this.isSelectedItem(item));
    if (selectedItems === undefined || selectedItems.length === 0) {
      this.triggerLabel = this.placeholder;
    } else if (selectedItems.length === 1) {
      this.triggerLabel = selectedItems[0].label;
    } else {
      this.triggerLabel = `${selectedItems[0].label} and ${selectedItems.length - 1} more`;
    }
  }

  private buildObservableOfSelected(): Observable<SelectOption<V>[] | undefined> {
    if (!this.items) {
      return EMPTY;
    }

    return queryListAndChanges$(this.items).pipe(
      switchMap(items => merge(of(undefined), ...items.map(option => option.optionChange$))),
      map(() => this.findItems(this.selected))
    );
  }

  // Find the select option object for a value
  private findItems(value: V[] | undefined): SelectOption<V>[] | undefined {
    if (this.items === undefined) {
      this.loggerService.warn(`Invalid items for select option '${String(value)}'`);

      return undefined;
    }

    return this.items.filter(item => this.isSelectedItem(item));
  }
}

export const enum TriggerLabelDisplayMode {
  Placeholder = 'placeholder',
  Selection = 'selection'
}
