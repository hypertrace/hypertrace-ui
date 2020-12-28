import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import {
  CoreTableCellRendererType,
  SequenceSegment,
  SplitterDirection,
  StatefulTableRow,
  TableColumnConfig,
  TableComponent,
  TableDataSource,
  TableMode,
  TableStyle
} from '@hypertrace/components';
import { of } from 'rxjs';

import { TypedSimpleChanges } from '@hypertrace/common';
import { WaterfallTableCellType } from './span-name/span-name-cell-type';
import { WaterfallData, WaterfallDataNode } from './waterfall-chart';
import { WaterfallChartService } from './waterfall-chart.service';

@Component({
  selector: 'ht-waterfall-chart',
  styleUrls: ['./waterfall-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="waterfall-chart" *ngIf="this.datasource">
      <div class="table">
        <ht-table
          #table
          [columnConfigs]="this.columnDefs"
          [data]="this.datasource"
          mode="${TableMode.Tree}"
          display="${TableStyle.FullPage}"
          [pageable]="false"
          [initialExpandAll]="true"
          [selections]="this.selectedNode ? [this.selectedNode] : []"
          [hovered]="this.hoveredNode"
          (hoveredChange)="this.onHover($event)"
          (selectionsChange)="this.onSelection($event)"
          (toggleRowChange)="this.onTableRowToggled($event)"
          (toggleAllChange)="this.onToggleAll($event)"
        >
        </ht-table>
      </div>
      <ht-splitter class="splitter" direction="${SplitterDirection.Horizontal}"></ht-splitter>
      <div class="sequence">
        <ht-sequence-chart
          unit="ms"
          [data]="this.segments"
          class="chart"
          [selection]="this.selectedNode"
          (selectionChange)="this.onSelection($event ? [$event] : [])"
          [hovered]="this.hoveredNode"
          (hoveredChange)="this.onHover($event)"
        >
        </ht-sequence-chart>
      </div>
    </div>
  `
})
export class WaterfallChartComponent implements OnChanges {
  @Input()
  public data?: WaterfallData[];

  @Output()
  public readonly selectionChange: EventEmitter<WaterfallData> = new EventEmitter();

  @ViewChild('table')
  private readonly table!: TableComponent;

  public datasource?: TableDataSource<WaterfallDataNode>;
  public readonly columnDefs: TableColumnConfig[] = [
    {
      id: '$$spanName',
      visible: true,
      sortable: false,
      title: 'Name',
      display: WaterfallTableCellType.SpanName
    },
    {
      id: '$$iconType',
      visible: true,
      sortable: false,
      title: '',
      width: '48px',
      display: CoreTableCellRendererType.Icon
    }
  ];

  // Current State
  public segments: SequenceSegment[] = [];
  private dataNodeMap: Map<string, WaterfallDataNode> = new Map();

  public selectedNode?: WaterfallDataNode;
  public hoveredNode?: WaterfallDataNode;

  public constructor(private readonly waterfallChartService: WaterfallChartService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.datasource = this.buildDatasource(this.data);
      this.setInitialSelection();
    }
  }

  public onExpandAll(): void {
    this.table.expandAllRows();
  }

  public onCollapseAll(): void {
    this.table.collapseAllRows();
  }

  public onTableRowToggled(row: StatefulTableRow): void {
    // Find the corresponding node in the map and update its state
    const rowNode = this.dataNodeMap.get(row.id as string) as WaterfallDataNode;
    this.toggleChildNodeVisibility(rowNode, !this.areChildrenVisible(rowNode));
    this.buildSegmentsData();
  }

  public onToggleAll(expanded: boolean): void {
    this.dataNodeMap.forEach(node => this.toggleAllChildNodeVisibility(node, expanded));
    this.buildSegmentsData();
  }

  public onSelection(datum: { id: string }[]): void {
    // Waterfall does not support multi selections
    const selected = datum.length > 0 ? datum[datum.length - 1] : undefined;
    this.selectedNode = selected?.id !== undefined ? this.dataNodeMap.get(selected?.id) : undefined;
    this.selectionChange.emit(this.selectedNode);
  }

  public onHover(datum?: { id: string }): void {
    this.hoveredNode = datum?.id !== undefined ? this.dataNodeMap.get(datum.id) : undefined;
  }

  private buildDatasource(sequenceData: WaterfallData[]): TableDataSource<WaterfallDataNode> {
    const rootLevelRows = this.buildAndCollectSequenceRootNodes(sequenceData);

    return {
      getData: () =>
        of({
          data: rootLevelRows,
          totalCount: rootLevelRows.length
        }),
      getScope: () => ''
    };
  }

  private buildAndCollectSequenceRootNodes(sequenceData: WaterfallData[]): WaterfallDataNode[] {
    this.buildSequenceMap(sequenceData);
    this.buildSegmentsData();

    return this.collectRootNodes();
  }

  private buildSequenceMap(sequenceData: WaterfallData[]): void {
    this.dataNodeMap = this.waterfallChartService.buildSequenceMap(sequenceData);
  }

  private buildSegmentsData(): void {
    this.segments = this.waterfallChartService.buildSegmentsData(this.dataNodeMap);
  }

  private collectRootNodes(): WaterfallDataNode[] {
    return this.waterfallChartService.collectRootNodes(this.dataNodeMap);
  }

  private setInitialSelection(): void {
    const executionEntry = this.data?.find(datum => datum.isCurrentExecutionEntrySpan);
    if (executionEntry?.id !== undefined) {
      this.selectedNode = this.dataNodeMap.get(executionEntry?.id);
    }
  }

  private toggleChildNodeVisibility(dataNode: WaterfallDataNode, expanded: boolean): void {
    dataNode.$$state.children.forEach(node => {
      node.$$state.expanded = expanded;

      // When collapsing, we want to collapse all descendants, but when expanding only the current
      if (!expanded) {
        this.toggleChildNodeVisibility(node, expanded);
      }
    });
  }

  private toggleAllChildNodeVisibility(dataNode: WaterfallDataNode, expanded: boolean): void {
    dataNode.$$state.children.forEach(child => {
      if (child.$$state.parent !== undefined) {
        child.$$state.expanded = expanded;
        this.toggleAllChildNodeVisibility(child, expanded);
      }
    });
  }

  private areChildrenVisible(dataNode: WaterfallDataNode): boolean {
    return dataNode.$$state.children.every(child => child.$$state.expanded);
  }
}
