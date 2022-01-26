import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { DomElementScrollIntoViewService, isNonEmptyString, TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty, isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverComponent } from '../popover/popover.component';
import { ComboBoxMode, ComboBoxOption, ComboBoxResult } from './combo-box-api';

@Component({
  selector: 'ht-combo-box',
  styleUrls: ['./combo-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ComboBoxComponent
    }
  ],
  template: `
    <ht-popover (popoverOpen)="this.onPopoverOpen($event)" (popoverClose)="this.onPopoverClose()" class="combo-box">
      <ht-popover-trigger>
        <div
          #trigger
          class="popover-trigger"
          [ngClass]="{
            input: this.mode === '${ComboBoxMode.Input}',
            chip: this.mode === '${ComboBoxMode.Chip}',
            'show-border': this.showBorder,
            disabled: this.disabled
          }"
          [class.has-text]="this.text"
          [class.input-focused]="input.matches(':focus')"
        >
          <!-- Optional Icon -->
          <div *ngIf="this.icon" class="trigger-icon trigger-control">
            <ht-icon [icon]="this.icon" size="${IconSize.Small}"></ht-icon>
          </div>

          <!-- Input -->
          <input
            #input
            class="trigger-input"
            [style.width]="this.width"
            [class.has-icon]="this.icon"
            [class.has-text]="this.text"
            [class.input-focused]="input.matches(':focus')"
            [ngClass]="this.mode"
            [placeholder]="this.placeholder || ''"
            [attr.disabled]="this.disabled ? '' : null"
            [ngModel]="this.text"
            (ngModelChange)="this.onInputChange($event)"
            (keydown.enter)="this.onEnter()"
            (keydown.tab)="this.onNextOption($event)"
            (keydown.arrowDown)="this.onNextOption($event)"
            (keydown.arrowUp)="this.onPrevOption($event)"
            (keydown.shift.tab)="this.onPrevOption($event)"
            (keydown.escape)="this.onEscape()"
            (select)="this.onSelect()"
          />

          <!-- Hidden Element -->
          <div #invisibleText class="invisible-text">{{ this.text }}</div>

          <!-- Clear Button -->
          <div
            *ngIf="!this.disabled"
            [class.has-text]="this.text"
            [class.input-focused]="input.matches(':focus')"
            [ngClass]="this.mode"
            class="trigger-clear-button trigger-control"
            (click)="this.onInputClear($event)"
          >
            <ht-icon icon="${IconType.CloseCircleFilled}" size="${IconSize.ExtraSmall}"></ht-icon>
          </div>
        </div>
      </ht-popover-trigger>
      <ht-popover-content>
        <div
          *ngIf="this.arePopoverOptionsAvailable()"
          [style.min-width.px]="trigger.offsetWidth"
          class="popover-content"
        >
          <div class="option-list" *ngIf="this.isFilteredOptionAvailable()">
            <!-- Simple string list when user does not provide a template (User option templates coming soon!) -->
            <div
              #optionElement
              *ngFor="let option of this.filteredOptions; index as i"
              [class.selected]="this.highlightedOptionIndex === i"
              (click)="this.onOptionClick(option)"
              [htTooltip]="option.tooltip"
              class="popover-item"
            >
              <ht-icon class="option-icon" [icon]="option.icon" *ngIf="option.icon"></ht-icon>
              <div [innerHtml]="option.text | htHighlight: { text: this.text!, highlightType: 'mark' }"></div>
            </div>
          </div>
          <div
            *ngIf="this.isCreateOptionAvailable()"
            [class.selected]="this.highlightedOptionIndex === -1"
            (click)="this.onEnter()"
            [htTooltip]="this.createOption?.tooltip"
            class="popover-item create-option"
            [class.option-divider]="this.filteredOptions.length > 0"
          >
            <ht-icon class="option-icon" [icon]="this.createOption?.icon" *ngIf="this.createOption?.icon"></ht-icon>
            <span>{{ this.createOption?.text }}</span>
          </div>
        </div>
      </ht-popover-content>
    </ht-popover>
  `
})
export class ComboBoxComponent<TValue = string> implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input()
  public mode?: ComboBoxMode = ComboBoxMode.Input;

  @Input()
  public icon?: IconType;

  @Input()
  public placeholder?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public exactMatch: boolean = true;

  @Input()
  public autoSize: boolean = false;

  @Input()
  public provideCreateOption: boolean = false;

  @Input()
  public createOptionLabel?: string = 'Create';

  @Input()
  public text?: string = '';

  @Input()
  public options?: ComboBoxOption<TValue>[] = [];

  @Input()
  public showBorder: boolean = true;

  @Output()
  public readonly textChange: EventEmitter<string> = new EventEmitter();

  @Output()
  public readonly enter: EventEmitter<ComboBoxResult<TValue>> = new EventEmitter();

  @Output()
  public readonly selection: EventEmitter<ComboBoxResult<TValue>> = new EventEmitter();

  @Output()
  public readonly clear: EventEmitter<void> = new EventEmitter();

  @Output()
  public readonly escape: EventEmitter<void> = new EventEmitter();

  @ViewChild(PopoverComponent)
  public readonly popoverComponent!: PopoverComponent;

  @ViewChild('input', { read: ElementRef })
  public readonly input!: ElementRef;

  @ViewChild('invisibleText', { read: ElementRef })
  public readonly invisibleText!: ElementRef;

  @ViewChildren('optionElement', { read: ElementRef })
  public readonly optionElements!: QueryList<ElementRef>;

  private popoverRef: PopoverRef | undefined;

  public highlightedOptionIndex: number = 0;
  public filteredOptions: ComboBoxOption<TValue>[] = [];
  public width: string = '100%';

  public createOption?: ComboBoxOption<TValue>;

  private propagateControlValueChange?: (value: string | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: string | undefined) => void;

  public constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly scrollIntoViewService: DomElementScrollIntoViewService
  ) {}

  public ngAfterViewInit(): void {
    this.measureText();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.options || changes.text) {
      this.setFilteredOptions(this.text);
    }
  }

  public ngOnDestroy(): void {
    this.popoverRef?.close();
  }

  private buildCreateOption(text: string): ComboBoxOption<TValue> {
    return {
      text: `${this.createOptionLabel} "${text}"`,
      tooltip: text,
      icon: IconType.AddCircleOutline
    };
  }

  private setFilteredOptions(searchText?: string): void {
    this.filteredOptions = isEmpty(searchText)
      ? this.options ?? []
      : (this.options ?? []).filter(option => option.text.toLowerCase().includes(searchText!.toLowerCase()));
    this.createOption = this.isShowCreateOption(searchText) ? this.buildCreateOption(searchText) : undefined;
    this.setHighlightedOptionIndex();
  }

  private isShowCreateOption(searchText?: string): searchText is string {
    return (
      this.provideCreateOption &&
      isNonEmptyString(searchText) &&
      this.filteredOptions.find(option => option.text === searchText) === undefined
    );
  }

  private setText(text: string = ''): void {
    if (text !== this.text) {
      this.text = text;
      this.invisibleText.nativeElement.innerText = this.text;
      this.measureText();
      this.setHighlightedOptionIndex();
      this.textChange.emit(this.text);
      this.propagateValueChangeToFormControl(this.text);
    }
  }

  private setHighlightedOptionIndex(): void {
    this.highlightedOptionIndex = this.provideCreateOption
      ? this.filteredOptions.findIndex(option => option.text === this.text)
      : Math.max(
          this.filteredOptions.findIndex(option => option.text === this.text),
          0
        );
  }

  public onInputChange(text: string): void {
    this.setText(text);
    this.setFilteredOptions(text);
    this.showPopover();
  }

  public onInputClear(event: MouseEvent): void {
    this.setText();
    this.setFilteredOptions();
    event.stopPropagation(); // Stop popover from receiving click and opening
    this.clear.emit();
  }

  public onOptionClick(option: ComboBoxOption<TValue>): void {
    this.setText(option.text);
    this.hidePopover();
    this.focus();
    this.selection.emit(this.buildResult());
  }

  public onEnter(): void {
    if (this.arePopoverOptionsAvailable()) {
      if (this.highlightedOptionIndex >= 0) {
        this.setText(this.filteredOptions[this.highlightedOptionIndex].text);
      } else {
        this.setText(this.text);
      }
      this.hidePopover();
    }
    this.enter.emit(this.buildResult());
  }

  public onNextOption(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent tabbing to next control on page

    if (!this.arePopoverOptionsAvailable()) {
      return;
    }

    if (this.isCreateOptionAvailable() && this.isNextOptionBoundaryIndex()) {
      if (this.highlightedOptionIndex < 0) {
        this.highlightedOptionIndex = 0;
      } else if (this.highlightedOptionIndex >= this.filteredOptions.length - 1) {
        this.highlightedOptionIndex = -1;
      }
    } else {
      this.highlightedOptionIndex = ++this.highlightedOptionIndex % this.filteredOptions.length;
    }

    this.scrollIntoViewService.scrollIntoView(this.optionElements.get(this.highlightedOptionIndex)?.nativeElement);
  }

  private isNextOptionBoundaryIndex(): boolean {
    return this.highlightedOptionIndex < 0 || this.highlightedOptionIndex >= this.filteredOptions.length - 1;
  }

  public onPrevOption(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent tabbing to prev control on page

    if (!this.arePopoverOptionsAvailable()) {
      return;
    }

    if (this.isCreateOptionAvailable() && this.isPrevOptionBoundaryIndex()) {
      if (this.highlightedOptionIndex < 0) {
        this.highlightedOptionIndex = this.filteredOptions.length - 1;
      } else if (this.highlightedOptionIndex === 0) {
        this.highlightedOptionIndex = -1;
      }
    } else {
      this.highlightedOptionIndex =
        (--this.highlightedOptionIndex + this.filteredOptions.length) % this.filteredOptions.length;
    }

    this.scrollIntoViewService.scrollIntoView(this.optionElements.get(this.highlightedOptionIndex)?.nativeElement);
  }

  private isPrevOptionBoundaryIndex(): boolean {
    return this.highlightedOptionIndex <= 0;
  }

  public onSelect(): void {
    /*
     * This might just be a mac or browser specific thing, but when an input box gets tabbed into it doesn't
     * get focus, but the entire text content is selected. Let's use that to give ourselves focus as well.
     */
    this.focus();
  }

  public onEscape(): void {
    if (this.popoverRef?.visible) {
      this.hidePopover();
    } else {
      this.escape.emit();
    }
  }

  public onPopoverOpen(popoverRef: PopoverRef): void {
    if (this.disabled) {
      return;
    }

    this.setFilteredOptions(this.text);
    this.popoverRef = popoverRef;
  }

  public onPopoverClose(): void {
    this.popoverRef = undefined;
  }

  public showPopover(): void {
    if (this.popoverRef) {
      this.popoverRef.show();
    } else {
      this.popoverComponent.onClick();
    }
  }

  public hidePopover(): void {
    this.popoverRef?.hide();
  }

  public arePopoverOptionsAvailable(): boolean {
    return !!this.popoverRef?.visible && (this.isFilteredOptionAvailable() || this.isCreateOptionAvailable());
  }

  public isFilteredOptionAvailable(): boolean {
    return this.filteredOptions.length > 0;
  }

  public isCreateOptionAvailable(): boolean {
    return this.createOption !== undefined && !isNil(this.text);
  }

  public focus(): void {
    this.input.nativeElement.focus();
  }

  private buildResult(): ComboBoxResult<TValue> {
    return { text: this.text, option: this.findOption(this.text) };
  }

  private findOption(text: string | undefined): ComboBoxOption<TValue> | undefined {
    return text === undefined
      ? undefined
      : this.filteredOptions.find(option => {
          if (this.exactMatch) {
            return option.text.toLowerCase() === text.toLowerCase();
          }

          // First item in array that contains match
          return option.text.toLowerCase().includes(text.toLowerCase());
        });
  }

  private measureText(): void {
    if (!this.autoSize) {
      return;
    }

    // Calling setTimeout required to get proper measurement after DOM updates
    setTimeout(() => {
      // Add 6 pixels for input border, padding, etc
      this.width =
        this.text !== undefined && this.text !== ''
          ? `${(this.invisibleText.nativeElement.offsetWidth as number) + 6}px`
          : '100%';
      this.changeDetectorRef.markForCheck(); // Yes, required
    });
  }

  public setDisabledState(isDisabled?: boolean): void {
    this.disabled = isDisabled ?? false;
  }

  private propagateValueChangeToFormControl(value?: string): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }

  public writeValue(text?: string): void {
    this.text = text;
  }

  public registerOnChange(onChange: (value?: string) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: string) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }
}
