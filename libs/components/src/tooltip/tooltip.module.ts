import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverModule } from '../popover/popover.module';
import { TooltipContentContainerComponent } from './tooltip-content-container.component';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [TooltipDirective, TooltipContentContainerComponent],
  imports: [CommonModule, PopoverModule],
  exports: [TooltipDirective]
})
export class TooltipModule {}
