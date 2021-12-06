import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ToggleItem } from './toggle-item';
import { ToggleItemComponent } from './toggle-item.component';

@Component({
  selector: 'ht-toggle-group',
  styleUrls: ['./toggle-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-group">
      <div class="items">
        <div
          class="active"
          [style.left.px]="this.activeElementPosition.left"
          [style.width.px]="this.activeElementPosition.width"
        ></div>
        <div class="container" *ngFor="let item of this.items; let index = index">
          <div class="divider" *ngIf="index !== 0" [class.hide-divider]="this.shouldHideDivider(index)"></div>
          <ht-toggle-item
            class="tab"
            [label]="item.label"
            [icon]="item.icon"
            (click)="this.setActiveItem(item)"
          ></ht-toggle-item>
        </div>
      </div>
    </div>
  `
})
export class ToggleGroupComponent implements AfterViewInit, OnChanges {
  private static readonly DEFAULT_POSITION: ElementPosition = { left: 0, width: 0 };

  @Input()
  public readonly items?: ToggleItem[];

  @Input()
  public readonly activeItem?: ToggleItem;

  @Output()
  public readonly activeItemChange: EventEmitter<ToggleItem> = new EventEmitter();

  @ViewChildren(ToggleItemComponent, { read: ToggleItemComponent })
  private readonly toggleItemElements!: QueryList<ToggleItemComponent>;

  public initialized: boolean = false;
  public activeElementPosition: ElementPosition = ToggleGroupComponent.DEFAULT_POSITION;
  private activeItemIndex?: number;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (!this.initialized) {
      return;
    }

    if (changes.items || changes.activeItem) {
      this.setActiveItem();
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError due to ngAfterViewInit and ngOnChanges in same cycle
      this.setActiveItem();
      this.initialized = true;
    });
  }

  public setActiveItem(item: ToggleItem | undefined = this.activeItem): void {
    if (this.items === undefined || this.items.length === 0) {
      return;
    }

    const activeItem: ToggleItem = item || this.items[0];

    this.activeItemIndex = this.items.indexOf(activeItem);
    this.activeElementPosition = this.getElementPosition(activeItem, this.activeItemIndex);
    this.activeItemChange.emit(activeItem);
  }

  public shouldHideDivider(index: number): boolean {
    /*
     * Each item owns its left side vertical divider bar. This method is called by each item to see if it
     * needs to remove the divider it owns. From an item perspective, if we are active or the item to our
     * left is active, we want to remove our divider.
     */
    return (
      this.activeItemIndex !== undefined && (index - this.activeItemIndex === 1 || index - this.activeItemIndex === 0)
    );
  }

  private getElementPosition(item: ToggleItem, index: number = 0): ElementPosition {
    const element = this.getToggleItemElement(item)?.nativeElement;
    if (element === undefined) {
      return ToggleGroupComponent.DEFAULT_POSITION;
    }

    return {
      left: +element.offsetLeft + 2, // Add 2 for the margin on the parent
      width: element.offsetWidth - (index + 1) // Subtract approximate cumulative margin (not exact due to flexbox)
    };
  }

  private getToggleItemElement(item?: ToggleItem): ElementRef | undefined {
    return (
      item &&
      this.toggleItemElements &&
      this.toggleItemElements.find(itemElement => itemElement.label === item.label)?.elementRef
    );
  }
}

interface ElementPosition {
  left: number;
  width: number;
}
