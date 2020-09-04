import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverContainerComponent } from './container/popover-container.component';
import { PopoverContentComponent } from './popover-content.component';
import { PopoverPositionBuilder } from './popover-position-builder';
import { PopoverTriggerComponent } from './popover-trigger.component';
import { PopoverComponent } from './popover.component';
import { PopoverService } from './popover.service';

/*
Need to investigate this a bit more. Looks like it can't be root injectable because it needs overlay, which needs a
ComponentFactoryResolver that can vary based on import scope.
*/
@NgModule({
  providers: [PopoverService, PopoverPositionBuilder],
  declarations: [PopoverComponent, PopoverContainerComponent, PopoverContentComponent, PopoverTriggerComponent],
  exports: [PopoverComponent, PopoverContentComponent, PopoverTriggerComponent],
  imports: [OverlayModule, CommonModule]
})
export class PopoverModule {}
