import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelTagComponent } from './label-tag.component';

@NgModule({
  declarations: [LabelTagComponent],
  imports: [CommonModule, IconModule],
  exports: [LabelTagComponent]
})
export class LabelTagModule {}
