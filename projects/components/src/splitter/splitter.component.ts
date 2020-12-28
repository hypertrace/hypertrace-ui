import { Point } from './../../../common/src/utilities/math/math-utilities';
import { SubscriptionLifecycle } from './../../../common/src/utilities/rxjs/subscription-lifeycle.service';
import { map, takeUntil, tap, mergeMap, pairwise, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { fromEvent, throwError } from 'rxjs';
import { LayoutChangeService, TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-splitter',
  styleUrls: ['./splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: ` <div class="splitter" *ngIf="this.direction" [ngClass]="[this.direction | lowercase]"></div> `
})
export class SplitterComponent implements OnChanges {
  @Input()
  public readonly direction?: SplitterDirection;

  @Output()
  public readonly layoutChange: EventEmitter<boolean> = new EventEmitter();

  public constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly layoutChangeService: LayoutChangeService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    this.subscriptionLifecycle.unsubscribe();

    if (changes.direction && this.direction !== undefined) {
      this.setupMouseActionSubscription();
    }
  }

  private setupMouseActionSubscription(): void {
    this.subscriptionLifecycle.add(
      this.buildSplitterLayoutChangeObservable()
        .pipe(
          debounceTime(100),
          tap(layoutChange => this.layoutChange.emit(layoutChange)),
          tap(layoutChange => layoutChange && this.layoutChangeService.publishLayoutChange())
        )
        .subscribe()
    );
  }

  private buildSplitterLayoutChangeObservable(): Observable<boolean> {
    const hostElement = this.element.nativeElement as HTMLElement;
    const parentOfHostElement = hostElement.parentElement;

    if (!parentOfHostElement) {
      return throwError('Parent container element not present');
    }

    const moveOnParent$ = fromEvent<MouseEvent>(parentOfHostElement!, 'mousemove');
    const downOnHost$ = fromEvent<MouseEvent>(hostElement, 'mousedown');
    const upOnWindow$ = fromEvent<MouseEvent>(window, 'mouseup');

    return downOnHost$.pipe(
      mergeMap(() => moveOnParent$.pipe(takeUntil(upOnWindow$))),
      pairwise(),
      map(([previous, current]) => ({ x: current.clientX - previous.clientX, y: current.clientY - previous.clientY })),
      map(delta => this.maybeUpdateLayoutOfSiblings(delta))
    );
  }

  private maybeUpdateLayoutOfSiblings(delta: Point): boolean {
    let layoutChanged: boolean = false;

    const prevSibling = this.element.nativeElement.previousElementSibling;
    const nextSibling = this.element.nativeElement.nextElementSibling;

    if (this.direction === SplitterDirection.Horizontal) {
      if (prevSibling instanceof HTMLElement) {
        // Update width or height
        prevSibling.style.width = prevSibling.offsetWidth + delta.x + 'px';
        prevSibling.style.flex = 'none';
        layoutChanged = true;
      }

      if (nextSibling instanceof HTMLElement) {
        // Update width or height
        (nextSibling as HTMLElement).style.width = nextSibling.offsetWidth - delta.x + 'px';
        nextSibling.style.flex = 'none';
        layoutChanged = true;
      }
    }

    if (this.direction === SplitterDirection.Vertical) {
      if (prevSibling instanceof HTMLElement) {
        // Update width or height
        prevSibling.style.height = prevSibling.offsetHeight + delta.y + 'px';
        prevSibling.style.flex = 'none';
        layoutChanged = true;
      }

      if (nextSibling instanceof HTMLElement) {
        // Update width or height
        (nextSibling as HTMLElement).style.height = nextSibling.offsetHeight - delta.y + 'px';
        nextSibling.style.flex = 'none';
        layoutChanged = true;
      }
    }

    console.log(JSON.stringify(delta));
    return layoutChanged;
  }
}

export const enum SplitterDirection {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}
