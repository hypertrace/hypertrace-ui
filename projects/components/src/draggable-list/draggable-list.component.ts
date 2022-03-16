import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

@Component({
  selector: 'ht-draggable-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./draggable-list.component.scss'],
  template: `
    <div cdkDropList class="draggable-list" (cdkDropListDropped)="this.dropList($event)">
      <div
        *ngFor="let draggableItem of this.draggableItems"
        cdkDrag
        class="draggable-item"
        [ngClass]="{ disabled: disabled || draggableItem.disabled }"
        [cdkDragDisabled]="disabled || draggableItem.disabled"
      >
        <ng-container *ngTemplateOutlet="draggableItem.content"></ng-container>
      </div>
    </div>
  `
})
export class DraggableListComponent<T> implements AfterContentInit {
  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly draggableListChange: EventEmitter<T[]> = new EventEmitter();

  @ContentChildren(DraggableItemComponent)
  public draggableItemsRef!: QueryList<DraggableItemComponent<T>>;

  public draggableItems: DraggableItemComponent<T>[] = [];

  public ngAfterContentInit(): void {
    this.draggableItems = this.draggableItemsRef.toArray();
  }

  public dropList(event: CdkDragDrop<DraggableItemComponent<unknown>[]>): void {
    moveItemInArray(this.draggableItems, event.previousIndex, event.currentIndex);
    this.draggableListChange.emit(this.draggableItems.map(dragabbleItem => dragabbleItem.data!));
  }
}
