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
import { Observable } from 'rxjs';
import { ButtonStyle } from '../button/button';
import { PageEvent } from './page.event';
import { PaginationProvider } from './paginator-api';

@Component({
  selector: 'htc-paginator',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="paginator" *ngIf="this.totalItems">
      <htc-label
        class="label"
        label="{{ this.firstItemNumberForPage() }}-{{ this.lastItemNumberForPage() }} of {{ this.totalItems }}"
      >
      </htc-label>

      <div class="pagination-buttons">
        <!-- TODO: Change ToggleButtonComponent to be more generic ButtonGroupComponent to accommodate this use case -->
        <htc-button
          class="button previous-button"
          htcTooltip="Go to previous page"
          display="${ButtonStyle.Bordered}"
          icon="${IconType.Previous}"
          [disabled]="!this.hasPrevPage()"
          (click)="this.gotoPreviousPage()"
        >
        </htc-button>
        <htc-button
          class="button next-button"
          htcTooltip="Go to next page"
          display="${ButtonStyle.Bordered}"
          icon="${IconType.Next}"
          [disabled]="!this.hasNextPage()"
          (click)="this.gotoNextPage()"
        >
        </htc-button>
      </div>

      <htc-label class="label" label="Rows per Page:"></htc-label>

      <div class="page-size-select" *ngIf="this.pageSizeOptions.length">
        <htc-select [selected]="this.pageSize" (selectedChange)="this.onPageSizeChange($event)" showBorder="true">
          <htc-select-option *ngFor="let pageSize of this.pageSizeOptions" [value]="pageSize" [label]="pageSize">
          </htc-select-option>
        </htc-select>
      </div>
    </div>
  `
})
export class PaginatorComponent implements OnChanges, PaginationProvider {
  @Input()
  public pageSizeOptions: number[] = [25, 50, 100];

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
    // This is for supporting the programmatic usage of paginator for the Table chart. This should go away with the Table refactor
    this.changeDetectorRef.markForCheck();
  }
  public get totalItems(): number {
    return this._totalItems;
  }
  private _totalItems: number = 0;

  @Output()
  public readonly pageChange: EventEmitter<PageEvent> = new EventEmitter();

  public readonly pageEvent$: Observable<PageEvent> = this.pageChange.asObservable();

  public constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.totalItems) {
      this.gotoFirstPage();
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
  }
}
