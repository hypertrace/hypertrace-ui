import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { FilterAttribute } from '../../filtering/filter/filter-attribute';
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
      [ngClass]="this.classes"
      [htTooltip]="this.columnConfig.titleTooltip || this.columnConfig.title"
      class="table-header-cell-renderer"
    >
      <ng-container *ngIf="this.columnConfig?.filterable && this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>
      <div class="title" [ngClass]="this.classes" (click)="this.sortChange.emit()">{{ this.columnConfig.title }}</div>
      <ng-container *ngIf="this.columnConfig?.filterable && !this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>

      <ng-template #filterButton>
        <ht-in-filter-button
          class="filter-button"
          [metadata]="this.metadata"
          [attribute]="this.columnConfig.attribute"
          [values]="this.columnConfig.filterValues"
        ></ht-in-filter-button>
      </ng-template>
    </div>
  `
})
export class TableHeaderCellRendererComponent implements OnInit, OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public columnConfig?: TableColumnConfigExtended;

  @Input()
  public index?: number;

  @Input()
  public sort?: TableSortDirection;

  @Output()
  public readonly sortChange: EventEmitter<void> = new EventEmitter();

  public alignment?: TableCellAlignmentType;
  public leftAlignFilterButton: boolean = false;
  public classes: string[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfig || changes.sort) {
      this.classes = this.buildClasses();
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
      ...(this.columnConfig && TableCdkColumnUtil.isColumnSortable(this.columnConfig) ? ['sortable'] : [])
    ];
  }
}
