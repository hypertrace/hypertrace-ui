import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescriptionComponent } from './description.component';
import { LayoutChangeModule } from '../layout/layout-change.module';

@NgModule({
  imports: [CommonModule, LayoutChangeModule],
  declarations: [DescriptionComponent],
  exports: [DescriptionComponent]
})
export class DescriptionModule {}
