import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ListViewComponent } from './list-view.component';

@NgModule({
  declarations: [ListViewComponent],
  exports: [ListViewComponent],
  imports: [CommonModule, IconModule, TooltipModule]
})
export class ListViewModule {}
