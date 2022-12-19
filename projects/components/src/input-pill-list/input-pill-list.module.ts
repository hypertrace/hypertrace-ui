import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { InputPillListComponent } from './input-pill-list.component';

@NgModule({
  declarations: [InputPillListComponent],
  imports: [CommonModule, InputModule, IconModule],
  exports: [InputPillListComponent]
})
export class InputPillListModule {}
