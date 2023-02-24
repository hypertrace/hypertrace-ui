import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { SpinnerComponent } from './spinner.component';

@NgModule({
  imports: [CommonModule, IconModule, LabelModule],
  declarations: [SpinnerComponent],
  exports: [SpinnerComponent]
})
export class SpinnerModule {}
