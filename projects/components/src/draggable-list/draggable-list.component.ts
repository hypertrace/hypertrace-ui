import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ht-draggable-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div cdkDropList class="example-list" (cdkDropListDropped)="dropList($event)">
      <div
        *ngFor="let draggableItem of this.draggableItems"
        cdkDrag
        [cdkDragDisabled]="disabled || draggableItem.disabled"
      >
        <ng-container *ngTemplateOutlet="draggableItem.content"></ng-container>
      </div>
    </div>
  `
})
export class DraggableListComponent implements AfterContentInit {
  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly listOrderChange: EventEmitter<DraggableItemComponent[]> = new EventEmitter();

  @ContentChildren(DraggableItemComponent) draggableItemsRef!: QueryList<DraggableItemComponent>;
  public draggableItems: DraggableItemComponent[] = [];

  public ngAfterContentInit(): void {
    this.draggableItems = this.draggableItemsRef.toArray();
  }

  public dropList(event: CdkDragDrop<DraggableItemComponent[]>): void {
    moveItemInArray(this.draggableItems, event.previousIndex, event.currentIndex);
    this.listOrderChange.emit(this.draggableItems);
  }
}
