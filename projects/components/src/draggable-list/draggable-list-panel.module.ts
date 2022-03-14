import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DraggableListPanelComponent } from './draggable-list-panel.component';
import { DraggableItemPanelComponent } from './draggable-list-item/draggable-item-panel.component';

@NgModule({
  declarations: [DraggableListPanelComponent, DraggableItemPanelComponent],
  imports: [CommonModule, DragDropModule],
  exports: [DraggableListPanelComponent, DraggableItemPanelComponent]
})
export class DraggableListPanelModule {}
