import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldModule } from '../form-field/form-field.module';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { InputPillListComponent } from './input-pill-list.component';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';

@NgModule({
  declarations: [InputPillListComponent],
  imports: [CommonModule, InputModule, IconModule, ReactiveFormsModule, FormFieldModule, EventBlockerModule],
  exports: [InputPillListComponent]
})
export class InputPillListModule {}
