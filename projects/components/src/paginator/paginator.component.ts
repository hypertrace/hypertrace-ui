import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { merge, Observable, Subject } from 'rxjs';
import { ButtonSize, ButtonStyle, ButtonVariant } from '../button/button';
import { SelectSize } from '../select/select-size';
import { ToggleItem } from '../toggle-group/toggle-item';
import { PageEvent } from './page.event';
import { PaginationProvider } from './paginator-api';

@Component({
  selector: 'ht-paginator',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="paginator"
      [class.compact]="this.showCompactView"
      *ngIf="this.totalItems && this.totalItems >= this.minItemsBeforeDisplay"
    >
      <ht-label
        class="label"
        label="{{ this.firstItemNumberForPage() }}-{{ this.lastItemNumberForPage() }} of {{ this.totalItems }}"
      >
      </ht-label>
      <div class="pagination-buttons">
        <ht-button
          class="previous-button"
          [class.compact]="this.showCompactView"
          htTooltip="Go to previous page"
          label="{{ !this.showCompactView ? 'Prev' : '' }}"
          ariaLabel="Previous"
          variant="${ButtonVariant.Primary}"
          display="${ButtonStyle.Bordered}"
          size="${ButtonSize.Small}"
          icon="${IconType.ArrowLeft}"
          [disabled]="!this.hasPrevPage()"
          (click)="this.gotoPreviousPage()"
        >
        </ht-button>
        <ht-button
          class="next-button"
          [class.compact]="this.showCompactView"
          htTooltip="Go to next page"
          label="{{ !this.showCompactView ? 'Next' : '' }}"
          ariaLabel="Next"
          variant="${ButtonVariant.Primary}"
          display="${ButtonStyle.Bordered}"
          size="${ButtonSize.Small}"
          icon="${IconType.ArrowRight}"
          [disabled]="!this.hasNextPage()"
          (click)="this.gotoNextPage()"
        >
        </ht-button>
      </div>
      <ng-container *ngIf="!this.showCompactView">
        <ht-label class="label" label="Show"></ht-label>
      </ng-container>
      <div class="page-size-select" *ngIf="this.pageSizeOptions.length">
        <ht-select
          [selected]="this.pageSize"
          size="${SelectSize.Small}"
          (selectedChange)="this.onPageSizeChange($event)"
          [showBorder]="true"
        >
          <ht-select-option *ngFor="let pageSize of this.pageSizeOptions" [value]="pageSize" [label]="pageSize">
          </ht-select-option>
        </ht-select>
      </div>
      <ng-container *ngIf="!this.showCompactView">
        <ht-label class="label" label=" per page"></ht-label>
      </ng-container>
    </div>
  `
})
export class PaginatorComponent implements OnChanges, PaginationProvider {
  @Input()
  public pageSizeOptions: number[] = [25, 50, 100];

  @Input()
  public showCompactView: boolean = false;

  @Input()
  public set pageIndex(pageIndex: number) {
    this._pageIndex = pageIndex;
  }

  public get pageIndex(): number {
    return this._pageIndex ?? 0;
  }

  private _pageIndex?: number;

  @Input()
  public set pageSize(pageSize: number) {
    this._pageSize = pageSize;
  }

  public get pageSize(): number {
    return this._pageSize ?? 50;
  }

  private _pageSize?: number;

  @Input()
  public set totalItems(totalItems: number) {
    this._totalItems = totalItems;
    this.totalRecordsChange.emit(totalItems);
    this.recordsDisplayedChange.emit(Math.min(this.pageSize, totalItems));

    // This is for supporting the programmatic usage of paginator for the Table chart. This should go away with the Table refactor
    this.changeDetectorRef.markForCheck();
  }

  public get totalItems(): number {
    return this._totalItems;
  }

  private _totalItems: number = 0;

  private readonly pageSizeInputSubject: Subject<PageEvent> = new Subject();

  @Output()
  public readonly pageChange: EventEmitter<PageEvent> = new EventEmitter();

  @Output()
  public readonly recordsDisplayedChange: EventEmitter<number> = new EventEmitter();

  @Output()
  public readonly totalRecordsChange: EventEmitter<number> = new EventEmitter();

  // Caused either by a change in the provided page, or user change being emitted
  public readonly pageEvent$: Observable<PageEvent> = merge(this.pageChange, this.pageSizeInputSubject);

  public readonly minItemsBeforeDisplay: number = 10;

  public readonly tabs: ToggleItem<PaginatorButtonType>[] = [
    { label: PaginatorButtonType.Prev },
    { label: PaginatorButtonType.Next }
  ];

  public constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.totalItems) {
      this.gotoFirstPage();
    }
    if (changes.pageIndex || changes.pageSize) {
      this.pageSizeInputSubject.next({
        pageSize: this.pageSize,
        pageIndex: this.pageIndex
      });
    }
  }

  public onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.gotoFirstPage();
    this.emitChange();
  }

  private gotoFirstPage(): void {
    this.pageIndex = 0;
  }

  public gotoNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }
    this.pageIndex++;
    this.emitChange();
  }

  public gotoPreviousPage(): void {
    if (!this.hasPrevPage()) {
      return;
    }
    this.pageIndex--;
    this.emitChange();
  }

  public hasPrevPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  }

  public hasNextPage(): boolean {
    return this.pageIndex < this.maxPageIndex() && this.pageSize !== 0;
  }

  public firstItemNumberForPage(): number {
    return this.itemIndexAtPage() + 1;
  }

  public lastItemNumberForPage(): number {
    return this.itemIndexAtPage() + this.itemsInPage();
  }

  private itemIndexAtPage(): number {
    return this.pageIndex * this.pageSize;
  }

  private itemsInPage(): number {
    if (this.pageIndex < this.maxPageIndex()) {
      return this.pageSize;
    }

    return this.totalItems - this.itemIndexAtPage();
  }

  private maxPageIndex(): number {
    return this.numberOfPages() - 1;
  }

  private numberOfPages(): number {
    if (this.pageSize === 0) {
      return 0;
    }

    return Math.ceil(this.totalItems / this.pageSize);
  }

  private emitChange(): void {
    this.pageChange.next({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    });
    this.recordsDisplayedChange.emit(Math.min(this.pageSize, this.totalItems));
  }
}

const enum PaginatorButtonType {
  Next = 'Next',
  Prev = 'Prev'
}
