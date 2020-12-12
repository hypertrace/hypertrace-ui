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
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverComponent } from '../popover/popover.component';
import { ComboBoxMode, ComboBoxOption, ComboBoxResult } from './combo-box-api';

@Component({
  selector: 'ht-combo-box',
  styleUrls: ['./combo-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-popover (popoverOpen)="this.onPopoverOpen($event)" (popoverClose)="this.onPopoverClose()" class="combo-box">
      <ht-popover-trigger>
        <div
          #trigger
          class="popover-trigger"
          [ngClass]="this.mode"
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
          <!-- Simple string list when user does not provide a template (User option templates coming soon!) -->
          <div
            *ngFor="let option of this.filteredOptions; index as i"
            [class.selected]="this.highlightedOptionIndex === i"
            (click)="this.onOptionClick(option)"
            [htTooltip]="option.tooltip"
            class="popover-item"
          >
            <div [innerHtml]="option.text | htHighlight: [{ text: this.text, highlightType: 'mark' }]"></div>
          </div>
        </div>
      </ht-popover-content>
    </ht-popover>
  `
})
export class ComboBoxComponent<TValue = string> implements AfterViewInit, OnChanges, OnDestroy {
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
  public text?: string = '';

  @Input()
  public options?: ComboBoxOption<TValue>[] = [];

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

  private popoverRef: PopoverRef | undefined;

  public highlightedOptionIndex: number = 0;
  public filteredOptions: ComboBoxOption<TValue>[] = [];
  public width: string = '100%';

  public constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngAfterViewInit(): void {
    this.measureText();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.options) {
      this.setFilteredOptions();
    }
  }

  public ngOnDestroy(): void {
    this.popoverRef?.close();
  }

  private setFilteredOptions(text?: string): void {
    this.filteredOptions = (this.options ?? []).filter(option => text === undefined || option.text.includes(text));
    this.setHighlightedOptionIndex();
  }

  private setText(text: string = ''): void {
    if (text !== this.text) {
      this.text = text;
      this.invisibleText.nativeElement.innerText = this.text;
      this.measureText();
      this.setHighlightedOptionIndex();
      this.textChange.emit(this.text);
    }
  }

  private setHighlightedOptionIndex(): void {
    this.highlightedOptionIndex = Math.max(
      this.filteredOptions.findIndex(o => o.text === this.text),
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
    this.input.nativeElement.focus();
    this.selection.emit(this.buildResult());
  }

  public onEnter(): void {
    if (this.arePopoverOptionsAvailable()) {
      this.setText(this.filteredOptions[this.highlightedOptionIndex].text);
      this.hidePopover();
    }
    this.enter.emit(this.buildResult());
  }

  public onNextOption(event: KeyboardEvent): void {
    if (this.arePopoverOptionsAvailable()) {
      this.highlightedOptionIndex = ++this.highlightedOptionIndex % this.filteredOptions.length;
      event.preventDefault(); // Prevent tabbing to next control on page
    }
  }

  public onPrevOption(event: KeyboardEvent): void {
    if (this.arePopoverOptionsAvailable()) {
      this.highlightedOptionIndex =
        (--this.highlightedOptionIndex + this.filteredOptions.length) % this.filteredOptions.length;
      event.preventDefault(); // Prevent tabbing to prev control on page
    }
  }

  public onSelect(): void {
    /*
     * This might just be a mac or browser specific thing, but when an input box gets tabbed into it doesn't
     * get focus, but the entire text content is selected. Let's use that to give ourselves focus as well.
     */
    this.input.nativeElement.focus();
  }

  public onEscape(): void {
    if (this.popoverRef?.visible) {
      this.hidePopover();
    } else {
      this.escape.emit();
    }
  }

  public onPopoverOpen(popoverRef: PopoverRef): void {
    this.setFilteredOptions();
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
    return !!this.popoverRef?.visible && this.filteredOptions.length > 0;
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
}
