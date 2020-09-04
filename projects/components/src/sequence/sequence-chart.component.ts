import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { RecursivePartial, TypedSimpleChanges } from '@hypertrace/common';
import { minBy } from 'lodash-es';
import { SequenceOptions, SequenceSegment } from './sequence';
import { SequenceChartService } from './sequence-chart.service';
import { SequenceObject } from './sequence-object';

@Component({
  selector: 'htc-sequence-chart',
  styleUrls: ['./sequence-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="htc-sequence-chart" (htcLayoutChange)="this.buildChart()" #chartContainer></div> `
})
export class SequenceChartComponent implements OnChanges {
  @Input()
  public data: SequenceSegment[] = [];

  @Input()
  public unit?: string;

  @Input()
  public headerHeight?: number;

  @Input()
  public rowHeight?: number;

  @Input()
  public barHeight?: number;

  @Input()
  public selection?: SequenceSegment;

  @Input()
  public hovered?: SequenceSegment;

  @Output()
  public readonly selectionChange: EventEmitter<SequenceSegment | undefined> = new EventEmitter<
    SequenceSegment | undefined
  >();

  @Output()
  public readonly hoveredChange: EventEmitter<SequenceSegment | undefined> = new EventEmitter<
    SequenceSegment | undefined
  >();

  @ViewChild('chartContainer', { static: true })
  private readonly chartContainer!: ElementRef;

  private sequenceObject?: SequenceObject;

  public constructor(private readonly sequenceChartService: SequenceChartService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data || changes.unit || changes.headerHeight || changes.rowHeight || changes.barHeight) {
      this.buildChart();
    }

    if (changes.hovered) {
      if (this.sequenceObject) {
        // Hover change when chart exist. Do a dynamic update
        this.sequenceObject.setHoveredRow(this.hovered);
      } else {
        this.buildChart();
      }
    }

    if (changes.selection) {
      if (this.sequenceObject) {
        // Selection change when chart exist. Do a dynamic update
        this.sequenceObject.setSelectedRow(this.selection);
      } else {
        this.buildChart();
      }
    }
  }

  public buildChart(): void {
    this.sequenceObject = this.sequenceChartService.buildChart(
      this.chartContainer.nativeElement,
      this.buildSequenceOptions()
    );
  }

  private buildSequenceOptions(): RecursivePartial<SequenceOptions> {
    return {
      data: this.getNormalizedData(),
      selected: this.selection,
      hovered: this.hovered,
      headerHeight: this.headerHeight,
      rowHeight: this.rowHeight,
      barHeight: this.barHeight,
      unit: this.unit,
      onSegmentSelected: (segment?: SequenceSegment) => this.onSegmentSelected(segment),
      onSegmentHovered: (segment?: SequenceSegment) => this.onSegmentHovered(segment)
    };
  }

  private getNormalizedData(): SequenceSegment[] {
    const closestSegment = minBy(this.data, segment => segment.start);
    if (closestSegment === undefined) {
      return this.data;
    }
    const minStart = closestSegment.start;

    return this.data.map(segment => ({
      id: segment.id,
      start: segment.start - minStart,
      end: segment.end - minStart,
      label: segment.label,
      color: segment.color
    }));
  }

  private onSegmentSelected(segment?: SequenceSegment): void {
    this.selection = segment;
    this.selectionChange.emit(this.selection);
  }

  private onSegmentHovered(segment?: SequenceSegment): void {
    this.hovered = segment;
    this.hoveredChange.emit(segment);
  }
}
