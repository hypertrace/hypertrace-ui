import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TraceCheckboxModule } from '../checkbox/checkbox.module';
import { IconModule } from '../icon/icon.module';
import { InputModule } from '../input/input.module';
import { LabelModule } from '../label/label.module';
import { SelectModule } from '../select/select.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { DurationSelectorComponent } from './duration-selector.component';

@NgModule({
  imports: [CommonModule, TooltipModule, IconModule, LabelModule, TraceCheckboxModule, SelectModule, InputModule],
  declarations: [DurationSelectorComponent],
  exports: [DurationSelectorComponent]
})
export class DurationSelectorModule {}
