import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEqual } from 'lodash-es';
import { InFilterModalComponent, InFilterModalData } from '../../filtering/filter-modal/in-filter-modal.component';
import { FilterAttribute } from '../../filtering/filter/filter-attribute';
import { FilterOperator } from '../../filtering/filter/filter-operators';
import { FilterParserLookupService } from '../../filtering/filter/parser/filter-parser-lookup.service';
import { IconSize } from '../../icon/icon-size';
import { ModalSize } from '../../modal/modal';
import { ModalService } from '../../modal/modal.service';
import { TableCellAlignmentType } from '../cells/types/table-cell-alignment-type';
import { TableCdkColumnUtil } from '../data/table-cdk-column-util';
import { TableSortDirection } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';

@Component({
  selector: 'ht-table-header-cell-renderer',
  styleUrls: ['./table-header-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.columnConfig"
      [htTooltip]="this.getTooltip(this.columnConfig.titleTooltip, this.columnConfig.title)"
      class="table-header-cell-renderer"
    >
      <div class="title" [ngClass]="this.classes">
        <span class="title-text">{{ this.columnConfig.title }}</span>
      </div>

      <div class="sort-icons" *ngIf="this.isSortable">
        <ht-icon
          class="sort-icon"
          [class.active]="this.sort === '${TableSortDirection.Ascending}'"
          [icon]="'${IconType.ArrowUp}'"
          size="${IconSize.ExtraSmall}"
          htTooltip="Sort Ascending"
          (click)="this.onClickSortAsc()"
        ></ht-icon>

        <ht-icon
          class="sort-icon"
          [class.active]="this.sort === '${TableSortDirection.Descending}'"
          [icon]="'${IconType.ArrowDown}'"
          size="${IconSize.ExtraSmall}"
          htTooltip="Sort Descending"
          (click)="this.onClickSortDesc()"
        ></ht-icon>
      </div>

      <ng-container *ngIf="this.isShowOptionButton">
        <ng-container *ngTemplateOutlet="optionsButton"></ng-container>
      </ng-container>

      <ng-template #htmlTooltip>
        <div [innerHTML]="this.columnConfig?.titleTooltip"></div>
      </ng-template>

      <ng-template #optionsButton>
        <ht-popover class="options-button" [closeOnClick]="true">
          <ht-popover-trigger>
            <div #trigger>
              <ht-icon icon="${IconType.MoreVertical}" size="${IconSize.Small}"></ht-icon>
            </div>
          </ht-popover-trigger>
          <ht-popover-content>
            <div [style.min-width.px]="trigger.offsetWidth" class="popover-content">
              <ng-container *ngIf="this.isFilterable">
                <div class="popover-item" (click)="this.onFilterValues()" *ngIf="this.isFilterable">Filter Values</div>
              </ng-container>
              <ng-container *ngIf="this.columnConfig.sortable !== false">
                <div class="popover-item-divider"></div>
                <div class="popover-item sort-ascending" (click)="this.onSortChange(SORT_ASC)">
                  Sort Ascending
                  <ht-icon class="popover-item-icon" icon="${IconType.ArrowUp}" size="${IconSize.Small}"></ht-icon>
                </div>
                <div class="popover-item sort-descending" (click)="this.onSortChange(SORT_DESC)">
                  Sort Descending
                  <ht-icon class="popover-item-icon" icon="${IconType.ArrowDown}" size="${IconSize.Small}"></ht-icon>
                </div>
              </ng-container>

              <ng-container *ngIf="this.columnConfig.editable">
                <div class="popover-item" (click)="this.onHideCurrentColumn()">Hide</div>
              </ng-container>

              <ng-container *ngIf="this.isEditableAvailableColumns">
                <div class="popover-item-divider"></div>
                <div class="popover-item" (click)="this.onEditColumns()">Edit Columns</div>
              </ng-container>
            </div>
          </ht-popover-content>
        </ht-popover>
      </ng-template>
    </div>
  `,
})
export class TableHeaderCellRendererComponent implements OnInit, OnChanges {
  public readonly SORT_ASC: TableSortDirection = TableSortDirection.Ascending;
  public readonly SORT_DESC: TableSortDirection = TableSortDirection.Descending;

  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public availableColumns: TableColumnConfigExtended[] = [];

  @Input()
  public defaultColumns: TableColumnConfigExtended[] = [];

  @Input()
  public columnConfig?: TableColumnConfigExtended;

  @Input()
  public index?: number;

  @Input()
  public sort?: TableSortDirection;

  @Input()
  public indeterminateRowsSelected?: boolean;

  @Output()
  public readonly sortChange: EventEmitter<TableSortDirection | undefined> = new EventEmitter();

  @Output()
  public readonly showEditColumnsChange: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public readonly hideCurrentColumnChange: EventEmitter<boolean> = new EventEmitter();

  public alignment?: TableCellAlignmentType;
  public leftAlignFilterButton: boolean = false;
  public classes: string[] = [];

  public isFilterable: boolean = false;
  public isSortable: boolean = false;
  public isEditableAvailableColumns: boolean = false;
  public isShowOptionButton: boolean = false;

  @ViewChild('htmlTooltip')
  public htmlTooltipTemplate?: TemplateRef<unknown>;
  public sanitizedHtmlForTooltip?: string;

  public constructor(
    private readonly modalService: ModalService,
    private readonly filterParserLookupService: FilterParserLookupService,
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfig || changes.sort) {
      this.classes = this.buildClasses();
    }

    if (changes.columnConfig || changes.metadata) {
      this.isFilterable = this.isAttributeFilterable();
      this.isSortable = this.isAttributeSortable();
      this.isEditableAvailableColumns = this.areAnyAvailableColumnsEditable();
      this.isShowOptionButton =
        this.isFilterable || this.isEditableAvailableColumns || this.columnConfig?.sortable === true;
    }
  }

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.index === undefined) {
      throw new Error('Table column index undefined');
    }

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.columnConfig.renderer.alignment;
    this.leftAlignFilterButton = this.alignment === TableCellAlignmentType.Right;
    this.classes = this.buildClasses();
  }

  private buildClasses(): string[] {
    return [
      ...(this.alignment !== undefined ? [this.alignment.toLowerCase()] : []),
      ...(this.sort !== undefined ? [this.sort.toLowerCase()] : []),
    ];
  }

  public onClickSortAsc(): void {
    this.setSortAndEmit(isEqual(this.sort, this.SORT_ASC) ? undefined : this.SORT_ASC);
  }

  public onClickSortDesc(): void {
    this.setSortAndEmit(isEqual(this.sort, this.SORT_DESC) ? undefined : this.SORT_DESC);
  }

  public onSortChange(direction?: TableSortDirection): void {
    this.setSortAndEmit(direction ?? this.getNextSortDirection(this.sort));
  }

  private setSortAndEmit(direction?: TableSortDirection): void {
    this.sort = direction;
    this.sortChange.emit(this.sort);
  }

  public getTooltip(
    titleTooltip: string | undefined,
    title: string | undefined,
  ): string | TemplateRef<unknown> | undefined {
    if (titleTooltip === undefined) {
      return title;
    }

    return this.htmlTooltipTemplate;
  }

  private isAttributeFilterable(): boolean {
    return (
      this.metadata !== undefined &&
      this.columnConfig !== undefined &&
      this.columnConfig.filterable === true &&
      this.columnConfig.attribute !== undefined &&
      this.filterParserLookupService.isParsableOperatorForType(FilterOperator.In, this.columnConfig.attribute.type)
    );
  }

  private isAttributeSortable(): boolean {
    return (this.columnConfig && TableCdkColumnUtil.isColumnSortable(this.columnConfig)) ?? false;
  }

  private areAnyAvailableColumnsEditable(): boolean {
    if (this.availableColumns === undefined) {
      return false;
    }

    return this.availableColumns.some(column => this.isColumnEditable(column));
  }

  private isColumnEditable(columnConfig: TableColumnConfigExtended): boolean {
    return columnConfig.editable === true;
  }

  public onFilterValues(): void {
    this.isFilterable &&
      this.modalService.createModal<InFilterModalData>({
        content: InFilterModalComponent,
        size: ModalSize.Medium,
        showControls: true,
        title: 'Filter Column',
        data: {
          metadata: this.metadata || [],
          attribute: this.columnConfig?.attribute!,
          values: this.columnConfig?.filterValues ?? [],
        },
      });
  }

  public onEditColumns(): void {
    this.showEditColumnsChange.emit(true);
  }

  public onHideCurrentColumn(): void {
    this.hideCurrentColumnChange.emit(true);
  }

  private getNextSortDirection(sortDirection?: TableSortDirection): TableSortDirection | undefined {
    // Order: undefined -> Ascending -> Descending -> undefined
    switch (sortDirection) {
      case TableSortDirection.Ascending:
        return TableSortDirection.Descending;
      case TableSortDirection.Descending:
        return undefined;
      default:
        return TableSortDirection.Ascending;
    }
  }
}
