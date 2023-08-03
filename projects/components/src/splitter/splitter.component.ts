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
import { LayoutChangeService, TypedSimpleChanges, queryListAndChanges$ } from '@hypertrace/common';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SplitterDirection } from './splitter';
import { SplitterCellDimension, SplitterContentDirective } from './splitter-content.directive';
import { DOCUMENT } from '@angular/common';
import { debounce } from 'lodash-es';

@Component({
  selector: 'ht-splitter',
  styleUrls: ['./splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="splitter-container" *ngIf="this.direction" [ngClass]="[this.direction | lowercase]">
      <ng-container *ngFor="let content of this.contents$ | async as contents; let index = index">
        <div class="splitter-content" [ngStyle]="{ flex: this.getFlex | htMemoize: content.dimension }">
          <ng-container *ngTemplateOutlet="content.templateRef"></ng-container>
        </div>

        <div
          class="splitter"
          *ngIf="this.direction === '${SplitterDirection.Horizontal}' ? index !== contents.length - 1 : true"
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
  public readonly direction?: SplitterDirection = SplitterDirection.Horizontal;

  @Input()
  public readonly debounceTime: number = 20;

  @Input()
  public readonly splitterSize: number = 16;

  @Output()
  public readonly layoutChange: EventEmitter<SplitterCellDimension[]> = new EventEmitter();

  @ContentChildren(SplitterContentDirective)
  private readonly contents!: QueryList<SplitterContentDirective>;
  protected contents$!: Observable<SplitterContentDirective[]>;

  protected splitterSizeStyle?: Partial<CSSStyleDeclaration>;
  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  private size?: number;
  private resizeColumnSize?: number;
  private currentSplitterElement?: HTMLElement;
  private startPos?: number;
  private previous?: ContentWithMetadata;
  private next?: ContentWithMetadata;

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly element: ElementRef<HTMLElement>,
    private readonly layoutChangeService: LayoutChangeService,
    private readonly renderer: Renderer2
  ) {}

  public ngAfterContentInit(): void {
    this.contents$ = queryListAndChanges$(this.contents ?? EMPTY).pipe(map(contents => contents.toArray()));
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.splitterSize || changes.direction) {
      this.setSplitterSizeStyle();
    }
  }

  protected onGutterMouseDown(event: MouseEvent, index: number) {
    this.resizeStart(event, index);
    this.bindMouseListeners();
  }

  protected readonly getFlex = (dimension: SplitterCellDimension): string => {
    if (dimension.unit === 'PX') {
      return `1 1 ${dimension.value}${dimension.unit.toLowerCase()}`;
    } else {
      return `${dimension.value} ${dimension.value} 0`;
    }
  };

  protected horizontal() {
    return this.direction === SplitterDirection.Horizontal;
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

  private bindMouseListeners() {
    if (!this.mouseMoveListener) {
      this.mouseMoveListener = this.renderer.listen(this.document, 'mousemove', event => {
        this.debouncedOnResize(event);
      });
    }

    if (!this.mouseUpListener) {
      this.mouseUpListener = this.renderer.listen(this.document, 'mouseup', () => {
        this.resizeEnd();
        this.unbindMouseListeners();
      });
    }
  }

  private unbindMouseListeners() {
    this.mouseMoveListener?.();
    this.mouseMoveListener = undefined;

    this.mouseUpListener?.();
    this.mouseUpListener = undefined;
  }

  private resizeStart(event: MouseEvent, index: number) {
    this.currentSplitterElement = event.currentTarget as HTMLElement;
    this.size = this.getElementSize(this.element.nativeElement);
    this.resizeColumnSize = this.horizontal() ? this.size / 12 : 1;

    this.startPos = this.horizontal() ? event.pageX : event.pageY;

    this.previous = this.buildPreviousContentWithMetaData(index, this.currentSplitterElement);
    this.next = this.buildNextContentWithMetaData(index, this.currentSplitterElement);
  }

  private readonly debouncedOnResize: (event: MouseEvent) => void = debounce(this.onResize, 0);

  private onResize(event: MouseEvent): void {
    let newPos;

    if (
      this.size !== undefined &&
      this.startPos !== undefined &&
      this.resizeColumnSize !== undefined &&
      this.previous !== undefined
    ) {
      let newPrevPanelSize = 0;
      let newNextPanelSize = 0;

      if (this.horizontal()) {
        newPos = event.pageX - this.startPos;
        newPrevPanelSize = this.previous.size + newPos;
        if (this.next) {
          newNextPanelSize = this.next.size - newPos;
        }
      } else {
        newPos = event.pageY - this.startPos;
        newPrevPanelSize = this.previous.size + newPos;
        if (this.next) {
          newNextPanelSize = this.next.size; // Let the top container grow.
        }
      }

      if (this.validateResize(newPrevPanelSize, newNextPanelSize) && this.previous !== undefined) {
        this.previous.content.dimension = { value: newPrevPanelSize, unit: 'PX' };

        if (this.next) {
          this.next.content.dimension = { value: newNextPanelSize, unit: 'PX' };
        }

        this.setStyle();
      }
    }
  }

  private resizeEnd() {
    if (this.previous !== undefined && this.resizeColumnSize !== undefined && this.size !== undefined) {
      if (this.horizontal()) {
        this.previous.size = this.getElementSize(this.previous.element);

        let previousPanelColumnWidth = Math.round(this.previous.size / this.resizeColumnSize);
        this.previous.content.dimension = { value: previousPanelColumnWidth, unit: 'FR' };

        if (this.next) {
          this.next.size = this.getElementSize(this.next.element);

          let nextPanelColumnWidth = Math.round(
            (this.next.size - (previousPanelColumnWidth * this.resizeColumnSize - this.previous.size)) /
              this.resizeColumnSize
          );
          this.next.content.dimension = { value: nextPanelColumnWidth, unit: 'FR' };
        }

        this.setStyle();
      }
    }

    this.layoutChange.emit(this.contents.map(c => c.dimension));
    this.layoutChangeService.publishLayoutChange();
    this.clear();
  }

  private buildPreviousContentWithMetaData(index: number, splitterElement: HTMLElement): ContentWithMetadata {
    const element = splitterElement.previousElementSibling as HTMLElement;

    return {
      content: this.contents.get(index)!,
      index: index,
      element: element,
      size: this.getElementSize(element)
    };
  }

  private buildNextContentWithMetaData(index: number, splitterElement: HTMLElement): ContentWithMetadata | undefined {
    const element = splitterElement.nextElementSibling as HTMLElement | undefined;

    if (!element) {
      return undefined;
    }

    return {
      content: this.contents.get(index + 1)!,
      index: index,
      element: element,
      size: this.getElementSize(element)
    };
  }

  private getElementSize(element: HTMLElement): number {
    return this.horizontal() ? element.getBoundingClientRect().width : element.getBoundingClientRect().height;
  }

  private validateResize(_newPrevPanelSize: number, _newNextPanelSize?: number): boolean {
    /**
     * Stub method to validate resize. For now, returning true
     */
    return true;
  }

  private setStyle(): void {
    if (this.previous !== undefined) {
      this.renderer.setStyle(this.previous.element, 'flex', this.getFlex(this.previous.content.dimension));

      if (this.next) {
        this.renderer.setStyle(this.next.element, 'flex', this.getFlex(this.next.content.dimension));
      }
    }
  }

  private clear() {
    this.size = undefined;
    this.startPos = undefined;
    this.previous = undefined;
    this.next = undefined;
    this.currentSplitterElement = undefined;
  }
}

interface ContentWithMetadata {
  content: SplitterContentDirective;
  index: number;
  element: HTMLElement;
  size: number;
}
