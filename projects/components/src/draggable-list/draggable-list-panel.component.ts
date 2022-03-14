import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { DraggableItemPanelComponent } from './draggable-list-item/draggable-item-panel.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ht-draggable-list-panel',
  styleUrls: ['./draggable-list-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div cdkDropList class="example-list" (cdkDropListDropped)="dropList($event)">
      <div *ngFor="let dragabblePanel of this.draggablePanels" cdkDrag>
        <ng-container *ngTemplateOutlet="dragabblePanel.content"></ng-container>
      </div>
    </div>
  `
})
export class DraggableListPanelComponent implements AfterContentInit {
  @Input()
  public disabled: boolean = false;

  @ContentChildren(DraggableItemPanelComponent) draggableItemPanels!: QueryList<DraggableItemPanelComponent>;
  public draggablePanels!: DraggableItemPanelComponent[];
  public draggablePanelsLoaded: boolean = false;

  public ngAfterContentInit(): void {
    this.draggablePanels = this.draggableItemPanels.toArray();
  }

  public dropList(event: CdkDragDrop<DraggableItemPanelComponent[]>): void {
    moveItemInArray(this.draggablePanels, event.previousIndex, event.currentIndex);
  }
}
