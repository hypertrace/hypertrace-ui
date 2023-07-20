import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { ToggleGroupComponent } from './toggle-group.component';
import { ToggleItemComponent } from './toggle-item.component';
import { TooltipModule } from '../tooltip/tooltip.module';

@NgModule({
  imports: [CommonModule, LabelModule, IconModule, TooltipModule],
  exports: [ToggleGroupComponent],
  declarations: [ToggleGroupComponent, ToggleItemComponent]
})
export class ToggleGroupModule {}
