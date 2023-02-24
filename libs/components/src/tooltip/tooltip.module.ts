import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverModule } from '../popover/popover.module';
import { ActionableTooltipDirective } from './actionable/actionable-tooltip.directive';
import { TooltipContentContainerComponent } from './tooltip-content-container.component';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [ActionableTooltipDirective, TooltipDirective, TooltipContentContainerComponent],
  imports: [CommonModule, PopoverModule],
  exports: [ActionableTooltipDirective, TooltipDirective]
})
export class TooltipModule {}
