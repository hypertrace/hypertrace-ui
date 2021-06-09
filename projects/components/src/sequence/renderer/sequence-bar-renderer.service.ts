import { ElementRef, Injectable } from '@angular/core';
import { ScaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SequenceChartAxisService } from '../axis/sequence-chart-axis.service';
import { Marker, SequenceLayoutStyleClass, SequenceOptions, SequenceSegment, SequenceSVGSelection } from '../sequence';
import { SequenceObject } from '../sequence-object';

@Injectable()
export class SequenceBarRendererService {
  private static readonly DATA_ROW_CLASS: string = 'data-row';
  private static readonly HOVERED_ROW_CLASS: string = 'hovered-row';
  private static readonly SELECTED_ROW_CLASS: string = 'selected-row';
  private static readonly MARKER_CLASS: string = 'marker';
  private static readonly MARKERS_CLASS: string = 'markers';
  private static readonly BACKDROP_CLASS: string = 'backdrop';
  private static readonly BACKDROP_BORDER_TOP_CLASS: string = 'backdrop-border-top';
  private static readonly BACKDROP_BORDER_BOTTOM_CLASS: string = 'backdrop-border-bottom';

  private readonly markerWidth: number = 2;

  public constructor(private readonly sequenceChartAxisService: SequenceChartAxisService) {}

  public drawBars(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    const plotSelection = chartSelection.select<SVGElement>(`.${SequenceLayoutStyleClass.Plot}`);
    const xScale = this.sequenceChartAxisService.updateScaleDomainAndTickSize(chartSelection, options);
    const plotWidth = Number(plotSelection.attr('width'));

    // Draw Top Border
    this.drawPlotTopBorder(plotSelection, plotWidth);

    // Draw Bar elements
    const barSelections = this.getDataRowsSelection(chartSelection).data(options.data);

    barSelections.exit().remove();

    const transformedBars = barSelections
      .enter()
      .append('svg:g')
      .attr('class', `${SequenceBarRendererService.DATA_ROW_CLASS}`)
      .merge(barSelections)
      .attr('transform', (_, index) => `translate(0, ${options.rowHeight * index})`)
      .attr('height', options.rowHeight);

    this.drawBackdropRect(transformedBars, options, plotWidth);
    this.drawBarValueRect(transformedBars, xScale, options);
    this.drawBarMarkers(plotSelection, xScale, options);
    this.drawBarValueText(transformedBars, xScale, options);
    this.setupHoverListener(transformedBars, options);
    this.setupClickListener(transformedBars, options);
    this.setupMarkerHoverListener(plotSelection, options);
    this.updateDataRowHover(chartSelection, options);
    this.updateDataRowSelection(chartSelection, options);
  }

  public updateDataRowHover(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.getDataRowsSelection(chartSelection).classed(
      `${SequenceBarRendererService.HOVERED_ROW_CLASS}`,
      dataRow => !!options.hovered && dataRow.id === options.hovered.id
    );
  }

  public updateDataRowSelection(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.getDataRowsSelection(chartSelection).classed(
      `${SequenceBarRendererService.SELECTED_ROW_CLASS}`,
      dataRow => !!options.selected && dataRow.id === options.selected.id
    );
  }

  private drawBackdropRect(
    transformedBars: TransformedBarSelection,
    options: SequenceOptions,
    plotWidth: number
  ): void {
    transformedBars
      .append('line')
      .attr('x1', -16)
      .attr('x2', plotWidth + 16)
      .attr('y1', 0)
      .attr('y2', 0)
      .classed(`${SequenceBarRendererService.BACKDROP_BORDER_TOP_CLASS}`, true);

    transformedBars
      .append('rect')
      .attr('x', -14)
      .attr('width', plotWidth + 16)
      .attr('height', options.rowHeight)
      .classed(`${SequenceBarRendererService.BACKDROP_CLASS}`, true);

    transformedBars
      .append('line')
      .attr('x1', -16)
      .attr('x2', plotWidth + 16)
      .attr('y1', options.rowHeight - 0.5)
      .attr('y2', options.rowHeight - 0.5)
      .classed(`${SequenceBarRendererService.BACKDROP_BORDER_BOTTOM_CLASS}`, true);
  }

  private drawBarValueRect(
    transformedBars: TransformedBarSelection,
    xScale: ScaleLinear<number, number>,
    options: SequenceOptions
  ): void {
    transformedBars
      .append('rect')
      .attr(
        'transform',
        dataRow => `translate(${xScale(dataRow.start)},${(options.rowHeight - options.barHeight) / 2})`
      )
      .attr('width', dataRow => Math.max(xScale(dataRow.end)! - xScale(dataRow.start)!, 3))
      .attr('height', options.barHeight)
      .style('fill', dataRow => dataRow.color)
      .attr('rx', '3')
      .attr('ry', '3')
      .classed('bar-value', true);
  }

  private drawBarMarkers(
    plotSelection: SequenceSVGSelection,
    xScale: ScaleLinear<number, number>,
    options: SequenceOptions
  ): void {
    options.data.forEach((segment, index) => {
      plotSelection
        .selectAll(`g.${SequenceBarRendererService.MARKERS_CLASS}`)
        .data(this.getGroupedMarkers(segment, xScale))
        .enter()
        .append('g')
        .classed(`${SequenceBarRendererService.MARKER_CLASS}`, true)
        .append('rect')
        .attr(
          'transform',
          dataRow =>
            `translate(${dataRow.markerTime},${
              (options.rowHeight - options.barHeight) / 2 + options.rowHeight * index
            })`
        )
        .attr('width', this.markerWidth)
        .attr('height', 12)
        .style('fill', 'white');
    });
  }

  private drawBarValueText(
    transformedBars: TransformedBarSelection,
    xScale: ScaleLinear<number, number>,
    options: SequenceOptions
  ): void {
    transformedBars
      .append('text')
      .classed('bar-value-text', true)
      .attr(
        'transform',
        dataRow => `translate(${xScale(dataRow.end)! + 10}, ${(options.rowHeight - options.barHeight) / 2})`
      )
      .attr('dy', '.82em')
      .style('font-size', '14px')
      .text(dataRow => `${dataRow.end - dataRow.start}${options.unit !== undefined ? options.unit : ''}`);
  }

  private drawPlotTopBorder(
    plotSelection: Selection<SVGElement, SequenceObject, null, undefined>,
    plotWidth: number
  ): void {
    plotSelection
      .append('line')
      .attr('x1', -16)
      .attr('x2', plotWidth + 16)
      .attr('y1', 0)
      .attr('y2', 0);
  }

  private setupHoverListener(transformedBars: TransformedBarSelection, options: SequenceOptions): void {
    transformedBars
      .on('mouseenter', (dataRow, index, nodes) => {
        select(nodes[index]).classed(`${SequenceBarRendererService.HOVERED_ROW_CLASS}`, true);
        this.onSegmentHovered(options, dataRow);
      })
      .on('mouseleave', (_, index, nodes) => {
        select(nodes[index]).classed(`${SequenceBarRendererService.HOVERED_ROW_CLASS}`, false);
        this.onSegmentHovered(options, undefined);
      });
  }

  private setupClickListener(transformedBars: TransformedBarSelection, options: SequenceOptions): void {
    transformedBars.on('click', clickedRow => {
      this.onSegmentClicked(options, clickedRow);

      transformedBars.classed(
        `${SequenceBarRendererService.SELECTED_ROW_CLASS}`,
        dataRow => !!options.selected && dataRow.id === options.selected.id
      );
    });
  }

  private getDataRowsSelection(chartSelection: SequenceSVGSelection): TransformedBarSelection {
    return chartSelection
      .select<SVGElement>(`.${SequenceLayoutStyleClass.Plot}`)
      .selectAll<BaseType, SequenceSegment>(`g.${SequenceBarRendererService.DATA_ROW_CLASS}`);
  }

  private onSegmentHovered(options: SequenceOptions, dataRow?: SequenceSegment): void {
    options.hovered = dataRow;
    options.onSegmentHovered(dataRow);
  }

  private onSegmentClicked(options: SequenceOptions, dataRow?: SequenceSegment): void {
    options.selected = options.selected === dataRow ? undefined : dataRow;
    options.onSegmentSelected(dataRow);
  }

  private setupMarkerHoverListener(plotSelection: SequenceSVGSelection, options: SequenceOptions): void {
    plotSelection
      .selectAll<SVGGElement, Marker>(`g.${SequenceBarRendererService.MARKER_CLASS}`)
      .on('mouseenter', (dataRow, index, nodes) => {
        options.onMarkerHovered({ marker: dataRow, origin: new ElementRef(nodes[index]) });
      });
  }

  private getGroupedMarkers(segment: SequenceSegment, xScale: ScaleLinear<number, number>): Marker[] {
    const scaledStart: number = Math.floor(xScale(segment.start)!);
    const scaledEnd: number = Math.floor(xScale(segment.end)!);
    const pixelScaledMarkers: Marker[] = segment.markers.map((marker: Marker) => ({
      ...marker,
      markerTime: Math.floor(xScale(marker.markerTime)!)
    }));
    const scaledNormalizedMarkers: Marker[] = [];
    let markerTime = -1 * Infinity;
    let index = -1;
    pixelScaledMarkers.forEach((marker: Marker) => {
      // For 1px gap
      if (marker.markerTime >= markerTime + this.markerWidth + 1) {
        index++;
        scaledNormalizedMarkers.push({
          ...marker,
          markerTime:
            marker.markerTime <= scaledStart + this.markerWidth // Grouping - closest to start
              ? scaledStart + this.markerWidth + 1
              : marker.markerTime >= scaledEnd - this.markerWidth // Grouping - closest to end
              ? scaledEnd - this.markerWidth - 2
              : marker.markerTime
        });
        markerTime = scaledNormalizedMarkers[index].markerTime;
      } else {
        scaledNormalizedMarkers[index] = {
          ...scaledNormalizedMarkers[index],
          timestamps: [...scaledNormalizedMarkers[index].timestamps, ...marker.timestamps]
        };
      }
    });

    return scaledNormalizedMarkers;
  }
}

type TransformedBarSelection = Selection<BaseType, SequenceSegment, SVGElement, SequenceObject>;
