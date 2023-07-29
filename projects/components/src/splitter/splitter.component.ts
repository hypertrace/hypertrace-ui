import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  QueryList,
  Renderer2
} from '@angular/core';
import {
  LayoutChangeService,
  SubscriptionLifecycle,
  TypedSimpleChanges,
  queryListAndChanges$
} from '@hypertrace/common';
import { EMPTY, Observable, throwError } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { SplitterDirection } from './splitter';
import { SplitterService } from './splitter.service';
import { SplitterContentDirective } from './splitter-content.directive';
import { DOCUMENT } from '@angular/common';
import { debounce } from 'lodash-es';

@Component({
  selector: 'ht-splitter',
  styleUrls: ['./splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SplitterService, SubscriptionLifecycle],
  template: `
    <div class="splitter-container" [ngClass]="[this.direction | lowercase]">
      <ng-container *ngFor="let content of this.contents$ | async as contents; let index = index">
        <ng-container *ngTemplateOutlet="content.templateRef"></ng-container>

        <div
          class="splitter"
          *ngIf="
            this.direction &&
            (this.direction === '${SplitterDirection.Horizontal}' ? index !== contents.length - 1 : true)
          "
          [ngClass]="[this.direction | lowercase]"
          [ngStyle]="this.splitterSizeStyle"
          (mousedown)="this.onGutterMouseDown($event, index)"
        >
          <div class="cursor"></div>
        </div>
      </ng-container>
    </div>
  `
})
export class SplitterComponent implements OnChanges, AfterContentInit {
  @Input()
  public readonly direction?: SplitterDirection;

  @Input()
  public readonly debounceTime: number = 20;

  @Input()
  public readonly splitterSize: number = 16;

  @Output()
  public readonly layoutChange: EventEmitter<boolean> = new EventEmitter();

  @ContentChildren(SplitterContentDirective)
  private readonly contents!: QueryList<SplitterContentDirective>;
  public contents$!: Observable<SplitterContentDirective[]>;

  public splitterSizeStyle?: Partial<CSSStyleDeclaration>;
  public panels: unknown[] = [];
  public dragging: boolean = false;
  public gutterSize: number = 4;
  public mouseMoveListener?: () => void;
  public mouseUpListener?: () => void;

  public size?: number;
  public resizeColumnSize?: number;

  public currentSplitterElement?: HTMLElement;

  public startPos?: number;

  public prevPanelElement?: HTMLElement;

  public nextPanelElement?: HTMLElement;

  public nextPanelSize?: number;

  public prevPanelSize?: number;

  public _panelSizes: number[] = [];

  public prevPanelIndex?: number;

  // private readonly window: Window;

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly element: ElementRef<HTMLElement>,
    private readonly splitterService: SplitterService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly layoutChangeService: LayoutChangeService,
    private readonly renderer: Renderer2
  ) {
    // this.window = this.document.defaultView as Window;
  }

  public ngAfterContentInit(): void {
    this.contents$ = queryListAndChanges$(this.contents ?? EMPTY).pipe(
      map(contents => contents.toArray()),
      tap(contents => (this.panels = contents))
    );
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.splitterSize || changes.direction) {
      this.setSplitterSizeStyle();
    }
    //   this.setupMouseActionSubscription();
  }

  public onGutterMouseDown(event: MouseEvent, index: number) {
    this.resizeStart(event, index);
    this.bindMouseListeners();
  }

  public bindMouseListeners() {
    if (!this.mouseMoveListener) {
      this.mouseMoveListener = this.renderer.listen(this.document, 'mousemove', event => {
        this.debouncedOnResize(event);
      });
    }

    if (!this.mouseUpListener) {
      this.mouseUpListener = this.renderer.listen(this.document, 'mouseup', event => {
        this.resizeEnd(event);
        this.unbindMouseListeners();
      });
    }
  }

  public unbindMouseListeners() {
    this.mouseMoveListener?.();
    this.mouseMoveListener = undefined;

    this.mouseUpListener?.();
    this.mouseUpListener = undefined;
  }

  public resizeStart(event: MouseEvent, index: number) {
    this.currentSplitterElement = event.currentTarget as HTMLElement;
    this.size = this.horizontal()
      ? this.element.nativeElement.getBoundingClientRect().width
      : this.element.nativeElement.getBoundingClientRect().height;
    this.resizeColumnSize = this.horizontal() ? this.size / 12 : 1;
    this.dragging = true;

    this.startPos = this.horizontal() ? event.pageX : event.pageY;

    this.prevPanelElement = this.currentSplitterElement.previousElementSibling as HTMLElement;
    this.nextPanelElement = this.currentSplitterElement.nextElementSibling as HTMLElement;

    this.prevPanelSize =
      (100 *
        (this.horizontal()
          ? this.prevPanelElement.getBoundingClientRect().width
          : this.prevPanelElement.getBoundingClientRect().height)) /
      this.size;

    this.nextPanelSize =
      (100 *
        (this.horizontal()
          ? this.nextPanelElement.getBoundingClientRect().width
          : this.nextPanelElement.getBoundingClientRect().height)) /
      this.size;

    this.prevPanelIndex = index;
  }

  private readonly debouncedOnResize: (event: MouseEvent) => void = debounce(this.onResize, 0);

  public onResize(event: MouseEvent): void {
    let newPos;

    if (
      this.size !== undefined &&
      this.startPos !== undefined &&
      this.resizeColumnSize !== undefined &&
      this.prevPanelSize !== undefined &&
      this.nextPanelSize !== undefined
    ) {
      let newPrevPanelSize;
      let newNextPanelSize;

      if (this.horizontal()) {
        newPos = (event.pageX * 100) / this.size - (this.startPos * 100) / this.size;
        newPrevPanelSize = this.prevPanelSize + newPos;
        newNextPanelSize = this.nextPanelSize - newPos;
      } else {
        newPos = (event.pageY * 100) / this.size - (this.startPos * 100) / this.size;
        newPrevPanelSize = this.prevPanelSize + newPos;

        newPrevPanelSize = this.prevPanelSize + newPos;
        newNextPanelSize = this.nextPanelSize;
      }

      if (this.validateResize(newPrevPanelSize, newNextPanelSize)) {
        (this.prevPanelElement as HTMLElement).style.flexBasis = `calc(${newPrevPanelSize}% - ${
          (this.panels.length - 1) * this.gutterSize
        }px)`;
        (this.nextPanelElement as HTMLElement).style.flexBasis = `calc(${newNextPanelSize}% - ${
          (this.panels.length - 1) * this.gutterSize
        }px)`;
        this._panelSizes[this.prevPanelIndex as number] = newPrevPanelSize;
        this._panelSizes[(this.prevPanelIndex as number) + 1] = newNextPanelSize;

        // if (this.prevPanelElement !== undefined && this.nextPanelElement !== undefined) {
        //   this.prevPanelSize =
        //   (100 *
        //     (this.horizontal()
        //       ? this.prevPanelElement.getBoundingClientRect().width
        //       : this.prevPanelElement.getBoundingClientRect().height)) /
        //   this.size;
        // this.nextPanelSize =
        //   (100 *
        //     (this.horizontal()
        //       ? this.nextPanelElement.getBoundingClientRect().width
        //       : this.nextPanelElement.getBoundingClientRect().height)) /
        //   this.size;
        // }
      }
    }
  }

  public validateResize(_newPrevPanelSize: number, _newNextPanelSize: number): boolean {
    // if (this.minSizes.length >= 1 && this.minSizes[0] && this.minSizes[0] > newPrevPanelSize) {
    //     return false;
    // }

    // if (this.minSizes.length > 1 && this.minSizes[1] && this.minSizes[1] > newNextPanelSize) {
    //     return false;
    // }

    return true;
  }

  public resizeEnd(_event: MouseEvent) {
    if (
      this.prevPanelSize !== undefined &&
      this.resizeColumnSize !== undefined &&
      this.nextPanelSize !== undefined &&
      this.size !== undefined
    ) {
      if (this.prevPanelElement !== undefined && this.nextPanelElement !== undefined) {
        this.prevPanelSize = this.horizontal()
          ? this.prevPanelElement.getBoundingClientRect().width
          : this.prevPanelElement.getBoundingClientRect().height;
        this.nextPanelSize = this.horizontal()
          ? this.nextPanelElement.getBoundingClientRect().width
          : this.nextPanelElement.getBoundingClientRect().height;
      }

      if (this.horizontal()) {
        let newPrevPanelSize =
          (Math.round(this.prevPanelSize / this.resizeColumnSize) * this.resizeColumnSize * 100) / this.size;
        let newPos = newPrevPanelSize - (this.prevPanelSize * 100) / this.size;
        let newNextPanelSize = (this.nextPanelSize * 100) / this.size - newPos;

        if (this.validateResize(newPrevPanelSize, newNextPanelSize)) {
          (this.prevPanelElement as HTMLElement).style.flexBasis = `calc(${newPrevPanelSize}% - ${
            (this.panels.length - 1) * this.gutterSize
          }px)`;
          (this.nextPanelElement as HTMLElement).style.flexBasis = `calc(${newNextPanelSize}% - ${
            (this.panels.length - 1) * this.gutterSize
          }px)`;
          this._panelSizes[this.prevPanelIndex as number] = newPrevPanelSize;
          this._panelSizes[(this.prevPanelIndex as number) + 1] = newNextPanelSize;

          if (this.prevPanelElement !== undefined && this.nextPanelElement !== undefined) {
            this.prevPanelSize =
              (100 *
                (this.horizontal()
                  ? this.prevPanelElement.getBoundingClientRect().width
                  : this.prevPanelElement.getBoundingClientRect().height)) /
              this.size;
            this.nextPanelSize =
              (100 *
                (this.horizontal()
                  ? this.nextPanelElement.getBoundingClientRect().width
                  : this.nextPanelElement.getBoundingClientRect().height)) /
              this.size;
          }
        }
      }
    }

    this.layoutChange.emit(true);
    this.layoutChangeService.publishLayoutChange();
    // this.onResizeEnd.emit({ originalEvent: event, sizes: this._panelSizes });
    // DomHandler.removeClass(this.gutterElement, 'p-splitter-gutter-resizing');
    // DomHandler.removeClass((this.containerViewChild as ElementRef).nativeElement, 'p-splitter-resizing');
    //  this.clear();
  }

  public clear() {
    this.dragging = false;
    this.size = undefined;
    this.startPos = undefined;
    this.prevPanelElement = undefined;
    this.nextPanelElement = undefined;
    this.prevPanelSize = undefined;
    this.nextPanelSize = undefined;
    this.currentSplitterElement = undefined;
    this.prevPanelIndex = undefined;
  }

  public horizontal() {
    return this.direction === SplitterDirection.Horizontal;
  }

  public setupMouseActionSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();

    this.subscriptionLifecycle.add(
      this.buildSplitterLayoutChangeObservable()
        .pipe(debounceTime(this.debounceTime))
        .subscribe(layoutChange => {
          this.layoutChange.emit(layoutChange);
          layoutChange && this.layoutChangeService.publishLayoutChange();
        })
    );
  }

  public readonly buildSplitterLayoutObservable = (splitterElement: HTMLElement): Observable<boolean> => {
    const hostElement = this.element.nativeElement;

    if (this.direction === undefined) {
      return throwError('Direction must be defined');
    }

    return this.splitterService.buildSplitterLayoutChangeObservable(
      splitterElement,
      hostElement,
      this.direction,
      this.splitterSize
    );
  };

  public buildSplitterLayoutChangeObservable(): Observable<boolean> {
    const hostElement = this.element.nativeElement;
    const splitterElement = hostElement.querySelector('.splitter') as HTMLElement;

    if (this.direction === undefined) {
      return throwError('Direction must be defined');
    }

    return this.splitterService.buildSplitterLayoutChangeObservable(
      splitterElement,
      hostElement,
      this.direction,
      this.splitterSize
    );
  }

  private setSplitterSizeStyle(): void {
    if (this.direction === SplitterDirection.Vertical) {
      this.splitterSizeStyle = {
        height: `${this.splitterSize}px`
      };
    }

    if (this.direction === SplitterDirection.Horizontal) {
      this.splitterSizeStyle = {
        width: `${this.splitterSize}px`
      };
    }
  }

  //   public static getOuterWidth(el, margin?) {
  //     let width = el.offsetWidth;

  //     if (margin) {
  //         let style = getComputedStyle(el);
  //         width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  //     }

  //     return width;
  // }

  // public static getOuterHeight(el, margin?) {
  //   let width = el.offsetWidth;

  //   if (margin) {
  //       let style = getComputedStyle(el);
  //       width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  //   }

  //   return width;
  // }
}
