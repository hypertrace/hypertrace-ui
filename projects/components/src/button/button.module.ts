import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { ButtonComponent } from './button.component';

@NgModule({
  imports: [CommonModule, IconModule, LabelModule, EventBlockerModule],
  declarations: [ButtonComponent],
  exports: [ButtonComponent]
})
export class ButtonModule {}
