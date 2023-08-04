import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListViewKeyRendererDirective } from './list-view-key-renderer.directive';
import { ListViewValueRendererDirective } from './list-view-value-renderer.directive';
import { ListViewComponent } from './list-view.component';
import { SummaryValuesModule } from '../summary-values/summary-values.module';
import { SummaryValueModule } from '../summary-value/summary-value.module';
import { IsEmptyPipeModule, MemoizeModule } from '@hypertrace/common';

@NgModule({
  declarations: [ListViewComponent, ListViewValueRendererDirective, ListViewKeyRendererDirective],
  exports: [ListViewComponent, ListViewValueRendererDirective, ListViewKeyRendererDirective],
  imports: [CommonModule, SummaryValuesModule, SummaryValueModule, MemoizeModule, IsEmptyPipeModule]
})
export class ListViewModule {}
