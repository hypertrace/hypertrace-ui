import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { ToggleButtonComponent } from './button/toggle-button.component';
import { ToggleButtonGroupComponent } from './toggle-button-group.component';

@NgModule({
  declarations: [ToggleButtonGroupComponent, ToggleButtonComponent],
  exports: [ToggleButtonGroupComponent, ToggleButtonComponent],
  imports: [CommonModule, IconModule, LabelModule]
})
export class ToggleButtonModule {}
