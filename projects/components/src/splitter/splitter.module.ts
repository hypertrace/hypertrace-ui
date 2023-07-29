import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SplitterComponent } from './splitter.component';
import { SplitterContentDirective } from './splitter-content.directive';
import { MemoizeModule } from '@hypertrace/common';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, ButtonModule, TooltipModule, MemoizeModule],
  declarations: [SplitterComponent, SplitterContentDirective],
  exports: [SplitterComponent, SplitterContentDirective]
})
export class SplitterModule {}
