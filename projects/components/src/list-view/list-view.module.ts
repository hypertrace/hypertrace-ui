import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListViewValueRendererDirective } from './list-view-value-renderer.directive';
import { ListViewComponent } from './list-view.component';

@NgModule({
  declarations: [ListViewComponent, ListViewValueRendererDirective],
  exports: [ListViewComponent, ListViewValueRendererDirective],
  imports: [CommonModule]
})
export class ListViewModule {}
