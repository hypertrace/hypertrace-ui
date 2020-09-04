import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GreetingLabelComponent } from './greeting-label.component';

@NgModule({
  declarations: [GreetingLabelComponent],
  exports: [GreetingLabelComponent],
  imports: [CommonModule]
})
export class GreetingLabelModule {}
