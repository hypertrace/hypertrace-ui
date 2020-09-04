import { NgModule } from '@angular/core';
import { LayoutChangeTriggerDirective } from './layout-change-trigger.directive';
import { LayoutChangeDirective } from './layout-change.directive';

@NgModule({
  declarations: [LayoutChangeTriggerDirective, LayoutChangeDirective],
  exports: [LayoutChangeTriggerDirective, LayoutChangeDirective]
})
export class LayoutChangeModule {}
