import { DOCUMENT } from '@angular/common';
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
  Renderer2,
} from '@angular/core';
import { assertUnreachable, LayoutChangeService, queryListAndChanges$, TypedSimpleChanges } from '@hypertrace/common';
import { debounce, isEmpty } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SplitterDirection } from './splitter';
import { SplitterCellDimension, SplitterContentDirective } from './splitter-content.directive';

@Component({
  selector: 'ht-splitter',
  styleUrls: ['./splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="splitter-container" *ngIf="this.direction" [ngClass]="this.classes">
      <ng-container *ngFor="let content of this.contents$ | async as contents; let index = index">
        <div
          class="splitter-content"
          [ngStyle]="{
            flex: this.buildFlex | htMemoize: content.dimension.value,
            maxHeight: this.buildMaxHeight | htMemoize: content.dimension.value
          }"
        >
          <ng-container *ngTemplateOutlet="content.templateRef"></ng-container>
        </div>

        <div
          class="splitter"
          *ngIf="this.direction === '${SplitterDirection.Horizontal}' ? index !== contents.length - 1 : true"
          [ngClass]="[this.direction | lowercase]"
          [ngStyle]="this.splitterSizeStyle"
          [class.disabled]="this.disabled"
          (mousedown)="this.onGutterMouseDown($event, index)"
          (mouseup)="this.onGutterMouseUp($event)"
        >
          <div class="background">
            <div class="cursor"></div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class SplitterComponent implements OnChanges, AfterContentInit {
  @Input()
  public readonly disabled?: boolean = true;

  @Input()
  public readonly direction?: SplitterDirection = SplitterDirection.Horizontal;

  @Input()
  public readonly debounceTime: number = 12;

  @Input()
  public readonly splitterSize: number = 16;

  @Output()
  public readonly layoutChange: EventEmitter<SplitterCellDimension[]> = new EventEmitter();

  @ContentChildren(SplitterContentDirective)
  private readonly contents!: QueryList<SplitterContentDirective>;
  protected contents$!: Observable<SplitterContentDirective[]>;

  protected classes: string[] = [];
  protected splitterSizeStyle?: Partial<CSSStyleDeclaration>;

  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  private normalizationParameters: NormalizationParameters = {
    itemCount: 0,
    pxPerItem: 0,
  };

  private resizeStartParameters: ResizeStartParameters = {
    startPositionPx: 0,
    prevContentStartSizePx: 0,
    nextContentStartSizePx: 0,
  };

  private readonly debounceResize = debounce(this.resize, this.debounceTime);

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly element: ElementRef<HTMLElement>,
    private readonly layoutChangeService: LayoutChangeService,
    private readonly renderer: Renderer2,
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.splitterSize || changes.direction) {
      this.setSplitterSizeStyle();
      this.classes = this.buildClasses();
    }
  }

  public ngAfterContentInit(): void {
    this.subscribeToQueryListChanges();
  }

  private buildNormalizationParams(contents: SplitterContentDirective[]): NormalizationParameters {
    const totalAvailablePx = this.getElementSizePx(this.element.nativeElement);
    const splitterPx = this.splitterSize * (contents.length - 1);
    const pxPerItem = (totalAvailablePx - splitterPx) / contents.length;

    return {
      itemCount: contents.length,
      pxPerItem: pxPerItem,
    };
  }

  private normalizeContentsDimensions(contents: SplitterContentDirective[]): SplitterContentDirective[] {
    this.normalizationParameters = this.buildNormalizationParams(contents);

    return contents.map(content => this.normalizeContentDimension(content));
  }

  private normalizeContentDimension(content: SplitterContentDirective): SplitterContentDirective {
    if (content.dimension.unit === 'FR') {
      content.dimension = {
        unit: 'PX',
        value: content.dimension.value * this.normalizationParameters.pxPerItem,
      };
    }

    return content;
  }

  protected onGutterMouseDown(event: MouseEvent, index: number): void {
    if (this.disabled) {
      return;
    }

    this.resizeStart(event, index);
    this.bindMouseListeners();
  }

  protected onGutterMouseUp(event: MouseEvent): void {
    this.resize(event);
    this.unbindMouseListeners();
  }

  private resizeStart(startEvent: MouseEvent, index: number): void {
    this.resizeStartParameters = this.buildResizeStartParameters(index, startEvent);
  }

  private resize(endEvent: MouseEvent): void {
    const prev = this.resizeStartParameters.prevContent;
    const next = this.resizeStartParameters.nextContent;

    const positionDiffPx = this.getClientPx(endEvent) - this.resizeStartParameters.startPositionPx;

    if (prev) {
      prev.dimension.value = this.resizeStartParameters.prevContentStartSizePx + positionDiffPx;
    }

    if (next) {
      next.dimension.value = this.resizeStartParameters.nextContentStartSizePx - positionDiffPx;
    }

    this.layoutChange.emit(this.contents.map(c => c.dimension));
    this.layoutChangeService.publishLayoutChange();
  }

  private buildResizeStartParameters(index: number, startEvent: MouseEvent): ResizeStartParameters {
    const prevContent = this.contents.get(index);
    const nextContent = this.contents.get(index + 1);

    return {
      startPositionPx: this.getClientPx(startEvent),
      prevContentStartSizePx: prevContent?.dimension.value ?? 0,
      nextContentStartSizePx: nextContent?.dimension.value ?? 0,
      prevContent: prevContent,
      nextContent: nextContent,
    };
  }

  private subscribeToQueryListChanges(): void {
    this.contents$ = queryListAndChanges$(this.contents ?? EMPTY).pipe(
      map(contents => contents.toArray()),
      map(contents => this.normalizeContentsDimensions(contents)),
    );
  }

  private bindMouseListeners() {
    if (!this.mouseMoveListener) {
      this.mouseMoveListener = this.renderer.listen(this.document, 'mousemove', event => this.debounceResize(event));
    }

    if (!this.mouseUpListener) {
      this.mouseUpListener = this.renderer.listen(this.document, 'mouseup', event => {
        this.resize(event);
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

  private getClientPx(event: MouseEvent): number {
    return this.isHorizontal() ? event.clientX : event.clientY;
  }

  private getElementSizePx(element: HTMLElement): number {
    return this.isHorizontal() ? element.getBoundingClientRect().width : element.getBoundingClientRect().height;
  }

  private isHorizontal() {
    return this.direction === SplitterDirection.Horizontal;
  }

  private setSplitterSizeStyle(): void {
    switch (this.direction) {
      case SplitterDirection.Horizontal:
        this.splitterSizeStyle = {
          width: `${this.splitterSize}px`,
        };
        break;
      case SplitterDirection.Vertical:
        this.splitterSizeStyle = {
          height: `${this.splitterSize}px`,
        };
        break;
      case undefined:
        break;
      default:
        assertUnreachable(this.direction);
    }
  }

  private buildClasses(): string[] {
    return [this.direction?.toLowerCase() ?? ''].filter(c => !isEmpty(c));
  }

  protected readonly buildFlex = (pixels: number): string => `1 1 ${pixels}px`;

  protected readonly buildMaxHeight = (pixels: number): string => (this.isHorizontal() ? '' : `${pixels}px`);
}

interface NormalizationParameters {
  itemCount: number;
  pxPerItem: number;
}

interface ResizeStartParameters {
  startPositionPx: number;
  prevContentStartSizePx: number;
  nextContentStartSizePx: number;
  prevContent?: SplitterContentDirective;
  nextContent?: SplitterContentDirective;
}
