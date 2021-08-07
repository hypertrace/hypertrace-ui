import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { DateCoercer, TypedSimpleChanges } from '@hypertrace/common';
import {
  CoreTableCellRendererType,
  Marker,
  MarkerDatum,
  PopoverBackdrop,
  PopoverPositionType,
  PopoverRef,
  PopoverRelativePositionLocation,
  PopoverService,
  SequenceSegment,
  StatefulTableRow,
  TableColumnConfig,
  TableComponent,
  TableDataSource,
  TableMode,
  TableStyle
} from '@hypertrace/components';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Span } from '../../../../graphql/model/schema/span';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { MarkerTooltipData } from './marker-tooltip/marker-tooltip.component';
import { WaterfallTableCellType } from './span-name/span-name-cell-type';
import { LogEvent, WaterfallData, WaterfallDataNode } from './waterfall-chart';
import { WaterfallChartService } from './waterfall-chart.service';

@Component({
  selector: 'ht-waterfall-chart',
  styleUrls: ['./waterfall-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpecificationBuilder],
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
      <div class="sequence">
        <ht-sequence-chart
          unit="ms"
          [data]="this.segments"
          class="chart"
          [selection]="this.selectedNode"
          (selectionChange)="this.onSelection($event ? [$event] : [])"
          [hovered]="this.hoveredNode"
          (hoveredChange)="this.onHover($event)"
          (markerHoveredChange)="this.onMarkerHover($event)"
        >
        </ht-sequence-chart>
      </div>
      <ng-template #markerTooltipTemplate>
        <ht-marker-tooltip [data]="this.markerTooltipData" (viewAll)="this.viewAll()"></ht-marker-tooltip>
      </ng-template>
    </div>
  `
})
export class WaterfallChartComponent implements OnChanges {
  @Input()
  public data?: WaterfallData[];

  @Output()
  public readonly selectionChange: EventEmitter<WaterfallData> = new EventEmitter();

  @Output()
  public readonly markerSelection: EventEmitter<MarkerSelection> = new EventEmitter();

  @ViewChild('table')
  private readonly table!: TableComponent;

  @ViewChild('markerTooltipTemplate')
  private readonly markerTooltipTemplate!: TemplateRef<unknown>;

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

  public markerTooltipData?: Observable<MarkerTooltipData>;
  private marker?: Marker;
  private popover?: PopoverRef;
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public constructor(
    private readonly waterfallChartService: WaterfallChartService,
    private readonly popoverService: PopoverService
  ) {}

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

  public onSelection(datum: { id: string; startTime: number }[]): void {
    // Waterfall does not support multi selections
    const selected = datum.length > 0 ? datum[datum.length - 1] : undefined;
    this.selectedNode = selected?.id !== undefined ? this.dataNodeMap.get(selected?.id) : undefined;

    if (this.selectedNode !== undefined) {
      const spanId = selected?.id!;
      const requestResponseBody$ = this.waterfallChartService.fetchRequestResponseBody(spanId, selected?.startTime!);
      this.selectionChange.emit({
        ...this.selectedNode,
        requestBody$: this.extractRequestBodyObservable(requestResponseBody$),
        responseBody$: this.extractResponseBodyObservable(requestResponseBody$)
      });
    } else {
      this.selectionChange.emit(this.selectedNode);
    }
  }

  private extractRequestBodyObservable(requestResponseBody$: Observable<Span>): Observable<string> {
    return requestResponseBody$.pipe(map(span => span.spanRequestBody as string));
  }

  private extractResponseBodyObservable(requestResponseBody$: Observable<Span>): Observable<string> {
    return requestResponseBody$.pipe(map(span => span.spanResponseBody as string));
  }

  public onHover(datum?: { id: string }): void {
    this.hoveredNode = datum?.id !== undefined ? this.dataNodeMap.get(datum.id) : undefined;
  }

  public viewAll(): void {
    this.markerSelection.emit({
      selectedData: this.marker?.id !== undefined ? this.dataNodeMap.get(this.marker?.id) : undefined,
      timestamps: this.marker?.timestamps ?? []
    });
    this.closePopover();
  }

  public onMarkerHover(datum?: MarkerDatum): void {
    if (datum && datum.marker && datum.origin) {
      this.closePopover();
      this.marker = datum.marker;
      this.markerTooltipData = this.buildMarkerDataSource(datum.marker);
      this.popover = this.popoverService.drawPopover({
        componentOrTemplate: this.markerTooltipTemplate,
        data: this.markerTooltipTemplate,
        position: {
          type: PopoverPositionType.Relative,
          origin: datum.origin,
          locationPreferences: [PopoverRelativePositionLocation.AboveRightAligned]
        },
        backdrop: PopoverBackdrop.Transparent
      });
      this.popover.closeOnBackdropClick();
    }
  }

  private closePopover(): void {
    this.popover?.close();
    this.popover = undefined;
  }

  private buildMarkerDataSource(marker: Marker): Observable<MarkerTooltipData> {
    const spanWaterfallData: WaterfallDataNode = this.dataNodeMap.get(marker.id)!;

    let markerData: MarkerTooltipData = {
      relativeTimes: [],
      summary: spanWaterfallData.logEvents.find(logEvent => logEvent.timestamp === marker.timestamps[0])?.summary ?? ''
    };
    spanWaterfallData.logEvents.forEach((logEvent: LogEvent) => {
      if (marker.timestamps.includes(logEvent.timestamp)) {
        const logEventTime = this.dateCoercer.coerce(logEvent.timestamp)!.getTime();
        markerData = {
          ...markerData,
          relativeTimes: [...markerData.relativeTimes, logEventTime - spanWaterfallData.startTime]
        };
      }
    });

    return of(markerData);
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

export interface MarkerSelection {
  selectedData: WaterfallDataNode | undefined;
  timestamps: string[];
}
