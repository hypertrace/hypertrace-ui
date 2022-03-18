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
import { queryListAndChanges$ } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';

@Component({
  selector: 'ht-draggable-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./draggable-list.component.scss'],
  template: `
    <div class="draggable-list" cdkDropList (cdkDropListDropped)="this.dropList($event)">
      <div
        *ngFor="let draggableItem of this.draggableItems$ | async"
        class="draggable-item"
        [ngClass]="{ disabled: this.disabled || draggableItem.disabled }"
        [cdkDragDisabled]="this.disabled || draggableItem.disabled"
        cdkDrag
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

  public draggableItems$!: Observable<DraggableItemComponent<T>[]>;

  public ngAfterContentInit(): void {
    this.draggableItems$ = queryListAndChanges$(this.draggableItemsRef).pipe(
      map(draggableItems => draggableItems.toArray())
    );
  }

  public dropList(event: CdkDragDrop<DraggableItemComponent<unknown>[]>): void {
    this.draggableItems$ = this.draggableItems$.pipe(
      tap(draggableItems => {
        moveItemInArray(draggableItems, event.previousIndex, event.currentIndex);
        this.draggableListChange.emit(draggableItems.map(dragabbleItem => dragabbleItem.data!));
      })
    );
  }
}
