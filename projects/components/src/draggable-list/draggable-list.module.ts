import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';
import { DraggableListComponent } from './draggable-list.component';

@NgModule({
  declarations: [DraggableListComponent, DraggableItemComponent],
  imports: [CommonModule, DragDropModule],
  exports: [DraggableListComponent, DraggableItemComponent]
})
export class DraggableListModule {}
