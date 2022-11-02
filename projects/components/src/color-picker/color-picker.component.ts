import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { Color, TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-color-picker',
  styleUrls: ['./color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ColorPickerComponent
    }
  ],
  template: `
    <div class="color-picker">
      <div
        class="color"
        *ngFor="let color of this.paletteColors"
        [ngClass]="{ selected: color === this.selected, disabled: this.disabled }"
        [style.backgroundColor]="color"
        (click)="this.selectColor(color)"
      ></div>
      <ht-popover [disabled]="this.disabled">
        <ht-popover-trigger>
          <ht-icon
            class="add-icon"
            [ngClass]="{ disabled: this.disabled }"
            icon="${IconType.Add}"
            size="${IconSize.Small}"
          ></ht-icon>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="container">
            <color-sketch class="color-sketch" (onChange)="this.onAddColorToPalette($event.color.hex)"></color-sketch>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class ColorPickerComponent implements ControlValueAccessor, OnChanges {
  @Input()
  public selected?: string;

  @Input()
  public disabled?: boolean = false;

  @Input()
  public noDeselectMode?: boolean = false;

  @Output()
  private readonly selectedChange: EventEmitter<string> = new EventEmitter<string>();

  private readonly paletteSet: Set<string> = new Set<string>([
    Color.Brown1,
    Color.Blue3,
    Color.Green3,
    Color.Orange3,
    Color.Purple3,
    Color.Red3,
    Color.Yellow3
  ]);
  public paletteColors: string[] = Array.from(this.paletteSet);

  private propagateControlValueChange?: (value: string | undefined) => void;
  private propagateControlValueChangeOnTouch?: (value: string | undefined) => void;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.selected) {
      this.initSelectedColor();
    }
  }

  public onAddColorToPalette(color: string): void {
    this.addNewColorToPalette(color);
    this.selectColor(color);
  }

  public selectColor(color: string): void {
    if (this.disabled || (this.noDeselectMode && color === this.selected)) {
      return;
    }

    const clickedColor = this.selected === color ? undefined : color;
    this.selected = clickedColor;
    this.selectedChange.emit(clickedColor);
    this.propagateValueChangeToFormControl(clickedColor);
  }

  private propagateValueChangeToFormControl(value?: string): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }

  public writeValue(color?: string): void {
    this.selected = color;
    this.initSelectedColor();
  }

  public registerOnChange(onChange: (value?: string) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: string) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public setDisabledState(isDisabled: boolean = false): void {
    this.disabled = isDisabled;
  }

  private initSelectedColor(): void {
    if (this.selected !== undefined && !this.paletteSet.has(this.selected)) {
      this.addNewColorToPalette(this.selected);
    }
  }

  private addNewColorToPalette(color: string): void {
    this.paletteSet.add(color);
    this.paletteColors = Array.from(this.paletteSet);
  }
}
