import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListViewComponent } from './list-view.component';

@NgModule({
  declarations: [ListViewComponent],
  exports: [ListViewComponent],
  imports: [CommonModule]
})
export class ListViewModule {}
