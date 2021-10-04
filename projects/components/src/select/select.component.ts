import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { LoggerService, queryListAndChanges$, SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { SelectControlOptionComponent, SelectControlOptionPosition } from './select-control-option.component';
import { SelectGroupPosition } from './select-group-position';
import { SelectJustify } from './select-justify';
import { SelectOption } from './select-option';
import { SelectOptionComponent } from './select-option.component';
import { SelectSize } from './select-size';

@Component({
  selector: 'ht-select',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div
      class="select"
      [ngClass]="[
        this.size,
        this.groupPosition,
        selected ? selected.style.toString() : '',
        this.showBorder ? 'border' : '',
        this.disabled ? 'disabled' : '',
        this.popoverOpen ? 'open' : ''
      ]"
      *htLetAsync="this.selected$ as selected"
    >
      <ht-popover
        [disabled]="this.disabled"
        [closeOnClick]="true"
        class="select-container"
        (popoverOpen)="this.popoverOpen = true"
        (popoverClose)="this.popoverOpen = false"
        [ngSwitch]="this.triggerDisplayMode"
      >
        <ht-popover-trigger>
          <div class="trigger-container" #triggerContainer>
            <div
              *ngSwitchCase="'${SelectTriggerDisplayMode.MenuWithBorder}'"
              class="trigger-content menu-with-border"
              [ngClass]="[this.justifyClass]"
            >
              <ht-icon
                *ngIf="this.getPrefixIcon(selected)"
                class="trigger-prefix-icon"
                [icon]="this.getPrefixIcon(selected)"
                [size]="this.iconSize"
                [color]="selected?.iconColor"
                [borderType]="selected?.iconBorderType"
                [borderColor]="selected?.iconBorderColor"
                [borderRadius]="selected?.iconBorderRadius"
              >
              </ht-icon>
              <ht-label class="trigger-label" [label]="selected?.selectedLabel || selected?.label || this.placeholder">
              </ht-label>
              <ng-container [ngTemplateOutlet]="selected?.content"></ng-container>
              <ht-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.ExtraSmall}"> </ht-icon>
            </div>
            <div
              *ngSwitchCase="'${SelectTriggerDisplayMode.Icon}'"
              class="trigger-content icon-only"
              [ngClass]="{ selected: this.selected !== undefined, open: this.popoverOpen }"
            >
              <ht-icon
                class="icon"
                *ngIf="this.icon"
                [icon]="this.icon"
                [size]="this.iconSize"
                [htTooltip]="this.selected?.label || this.placeholder"
              >
              </ht-icon>
            </div>
            <div
              *ngSwitchCase="'${SelectTriggerDisplayMode.MenuWithBackground}'"
              class="trigger-content menu-with-background"
              [ngClass]="[this.justifyClass]"
            >
              <ht-label class="trigger-label" [label]="selected?.selectedLabel || selected?.label || this.placeholder">
              </ht-label>
              <ng-container [ngTemplateOutlet]="selected?.content"></ng-container>
              <ht-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.Small}"> </ht-icon>
            </div>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="select-content" [ngStyle]="{ 'minWidth.px': triggerContainer.offsetWidth }">
            <ng-container *htLetAsync="this.topControlItems$ as topControlItems">
              <div *ngIf="topControlItems?.length !== 0">
                <ng-container
                  *ngTemplateOutlet="itemsTemplate; context: { items: topControlItems, showSelectionStatus: false }"
                ></ng-container>

                <ht-divider></ht-divider>
              </div>
            </ng-container>

            <ng-container
              *ngTemplateOutlet="itemsTemplate; context: { items: items, showSelectionStatus: true }"
            ></ng-container>
          </div>

          <ng-template #itemsTemplate let-items="items" let-showSelectionStatus="showSelectionStatus">
            <div
              *ngFor="let item of items"
              (click)="this.onSelectionChange(item)"
              class="select-option"
              [ngClass]="this.getStyleClassesForSelectItem | htMemoize: this.size:item"
            >
              <div class="select-option-info">
                <ht-icon
                  *ngIf="item.icon"
                  class="icon"
                  [icon]="item.icon"
                  size="${IconSize.Small}"
                  [color]="item.iconColor"
                  [borderType]="item?.iconBorderType"
                  [borderColor]="item?.iconBorderColor"
                  [borderRadius]="item?.iconBorderRadius"
                >
                </ht-icon>
                <span class="label">{{ item.label }}</span>
                <ng-container [ngTemplateOutlet]="item.content"></ng-container>
              </div>
              <ht-icon
                class="status-icon"
                *ngIf="showSelectionStatus && this.highlightSelected && this.isSelectedItem(item)"
                icon="${IconType.Checkmark}"
                size="${IconSize.Small}"
              ></ht-icon>
            </div>
          </ng-template>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class SelectComponent<V> implements AfterViewInit, OnChanges {
  @Input()
  public size: SelectSize = SelectSize.Medium;

  @Input()
  public selected?: V;

  @Input()
  public icon?: string;

  @Input()
  public iconSize?: IconSize = IconSize.Small;

  @Input()
  public triggerDisplayMode?: SelectTriggerDisplayMode = SelectTriggerDisplayMode.MenuWithBorder;

  @Input()
  public placeholder?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public showBorder: boolean = false;

  @Input()
  public justify?: SelectJustify;

  @Input()
  public highlightSelected: boolean = true;

  @Output()
  public readonly selectedChange: EventEmitter<V> = new EventEmitter<V>();

  @ContentChildren(SelectOptionComponent)
  public items?: QueryList<SelectOptionComponent<V>>;

  @ContentChildren(SelectControlOptionComponent)
  public controlItems?: QueryList<SelectControlOptionComponent<V>>;

  public selected$?: Observable<SelectOption<V> | undefined>;

  public groupPosition: SelectGroupPosition = SelectGroupPosition.Ungrouped;

  public topControlItems$?: Observable<SelectControlOptionComponent<V>[]>;

  public popoverOpen: boolean = false;

  public get justifyClass(): string {
    if (this.justify !== undefined) {
      return this.justify;
    }

    return this.showBorder ? SelectJustify.Left : SelectJustify.Right;
  }

  public constructor(
    private readonly loggerService: LoggerService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  public ngAfterViewInit(): void {
    this.selected$ = this.buildObservableOfSelected();
    if (this.controlItems !== undefined) {
      this.topControlItems$ = queryListAndChanges$(this.controlItems).pipe(
        map(items => items.filter(item => item.position === SelectControlOptionPosition.Top))
      );
    }
  }

  public getPrefixIcon(selectedOption: SelectOption<V> | undefined): string | undefined {
    return selectedOption?.icon ?? this.icon;
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (this.items !== undefined && changes.selected !== undefined) {
      this.selected$ = this.buildObservableOfSelected();
    }
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    return this.selected === item.value;
  }

  public updateGroupPosition(position: SelectGroupPosition): void {
    this.groupPosition = position;
    this.changeDetector.markForCheck();
  }

  private buildObservableOfSelected(): Observable<SelectOption<V> | undefined> {
    if (!this.items) {
      return EMPTY;
    }

    return queryListAndChanges$(this.items).pipe(
      switchMap(items => merge(of(undefined), ...items.map(option => option.optionChange$))),
      map(() => this.findItem(this.selected))
    );
  }

  public onSelectionChange(item: SelectOptionComponent<V>): void {
    if (item.disabled) {
      return;
    }

    this.selected = item.value;
    this.selected$ = this.buildObservableOfSelected();
    this.selectedChange.emit(this.selected);
  }

  private findItem(value: V | undefined): SelectOption<V> | undefined {
    if (this.items === undefined) {
      this.loggerService.warn(`Invalid items for select option '${String(value)}'`);

      return undefined;
    }

    return this.items.find(item => item.value === value);
  }

  public getStyleClassesForSelectItem(size: SelectSize, item: SelectOptionComponent<V>): string[] {
    const styles: string[] = [size];

    if (item.disabled) {
      styles.push('disabled');
    }

    return styles;
  }
}

export const enum SelectTriggerDisplayMode {
  MenuWithBorder = 'menu-with-border',
  MenuWithBackground = 'menu-with-background',
  Icon = 'icon'
}
