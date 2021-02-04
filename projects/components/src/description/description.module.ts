import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { DescriptionComponent } from './description.component';

@NgModule({
  imports: [CommonModule, LayoutChangeModule],
  declarations: [DescriptionComponent],
  exports: [DescriptionComponent]
})
export class DescriptionModule {}
