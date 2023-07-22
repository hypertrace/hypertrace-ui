import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorSketchModule } from 'ngx-color/sketch';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from './../popover/popover.module';
import { ColorPickerComponent } from './color-picker.component';

@NgModule({
  imports: [CommonModule, FormsModule, IconModule, ColorSketchModule, PopoverModule],
  declarations: [ColorPickerComponent],
  exports: [ColorPickerComponent]
})
export class ColorPickerModule {}
