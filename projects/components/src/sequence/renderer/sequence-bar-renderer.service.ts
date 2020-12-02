import { Injectable } from '@angular/core';
import { ScaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SequenceChartAxisService } from '../axis/sequence-chart-axis.service';
import { SequenceLayoutStyleClass, SequenceOptions, SequenceSegment, SequenceSVGSelection } from '../sequence';
import { SequenceObject } from '../sequence-object';

@Injectable()
export class SequenceBarRendererService {
  private static readonly DATA_ROW_CLASS: string = 'data-row';
  private static readonly HOVERED_ROW_CLASS: string = 'hovered-row';
  private static readonly SELECTED_ROW_CLASS: string = 'selected-row';
  private static readonly BACKDROP_CLASS: string = 'backdrop';
  private static readonly BACKDROP_BORDER_TOP_CLASS: string = 'backdrop-border-top';
  private static readonly BACKDROP_BORDER_BOTTOM_CLASS: string = 'backdrop-border-bottom';

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
    this.drawBarValueText(transformedBars, xScale, options);
    this.setupHoverListener(transformedBars, options);
    this.setupClickListener(transformedBars, options);
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
}

type TransformedBarSelection = Selection<BaseType, SequenceSegment, SVGElement, SequenceObject>;
