import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelTagModule } from '../label-tag/label-tag.module';
import { LabelModule } from '../label/label.module';
import { ToggleGroupComponent } from './toggle-group.component';
import { ToggleItemComponent } from './toggle-item.component';

@NgModule({
  imports: [CommonModule, LabelModule, IconModule, LabelTagModule],
  exports: [ToggleGroupComponent],
  declarations: [ToggleGroupComponent, ToggleItemComponent]
})
export class ToggleGroupModule {}
