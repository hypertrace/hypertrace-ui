import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { MessageDisplayComponent } from './message-display.component';

@NgModule({
  declarations: [MessageDisplayComponent],
  imports: [CommonModule, IconModule],
  exports: [MessageDisplayComponent]
})
export class MessageDisplayModule {}
