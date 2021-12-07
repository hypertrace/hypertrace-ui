import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListViewKeyRendererDirective } from './list-view-key-renderer.directive';
import { ListViewValueRendererDirective } from './list-view-value-renderer.directive';
import { ListViewComponent } from './list-view.component';

@NgModule({
  declarations: [ListViewComponent, ListViewValueRendererDirective, ListViewKeyRendererDirective],
  exports: [ListViewComponent, ListViewValueRendererDirective, ListViewKeyRendererDirective],
  imports: [CommonModule]
})
export class ListViewModule {}
