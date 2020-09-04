import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ExpanderToggleComponent } from './expander-toggle.component';

@NgModule({
  imports: [CommonModule, TooltipModule, IconModule],
  declarations: [ExpanderToggleComponent],
  exports: [ExpanderToggleComponent]
})
export class ExpanderToggleModule {}
