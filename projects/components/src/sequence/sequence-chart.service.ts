import { Injectable } from '@angular/core';
import { RecursivePartial } from '@hypertrace/common';
import { select } from 'd3-selection';
import { defaultsDeep } from 'lodash-es';
import { SequenceChartAxisService } from './axis/sequence-chart-axis.service';
import { SequenceChartLayoutService } from './layout/sequence-chart-layout.service';
import { SequenceBarRendererService } from './renderer/sequence-bar-renderer.service';
import { SequenceContainerSelection, SequenceOptions, SequenceSVGSelection } from './sequence';
import { SequenceObject } from './sequence-object';

@Injectable()
export class SequenceChartService {
  public constructor(
    private readonly sequenceChartLayoutService: SequenceChartLayoutService,
    private readonly sequenceChartAxisService: SequenceChartAxisService,
    private readonly sequenceBarRendererService: SequenceBarRendererService
  ) {}

  public buildChart(chartContainer: HTMLElement, options: RecursivePartial<SequenceOptions>): SequenceObject {
    const containerSelection = select<HTMLElement, SequenceObject>(chartContainer);
    const resolvedOptions = defaultsDeep({}, options, this.getDefaultOptions()) as SequenceOptions;

    // Clear existing chart, if any.
    this.clearSvg(containerSelection);

    // Draw
    const chartSelection = this.buildChartSelection(containerSelection, resolvedOptions);
    this.drawChart(chartSelection, resolvedOptions);

    const chartObject = new SequenceObject(containerSelection, resolvedOptions, this, this.sequenceBarRendererService);
    containerSelection.datum(chartObject);

    return chartObject;
  }

  public redraw(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.drawChart(chartSelection, options);
  }

  public getChartFromElement(chartContainer: HTMLElement): SequenceObject | undefined {
    const containerSelection = select<HTMLElement, SequenceObject | undefined>(chartContainer);

    return containerSelection.datum();
  }

  private drawChart(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.drawLayout(chartSelection, options);
    this.drawAxes(chartSelection, options);
    this.drawBars(chartSelection, options);
  }

  private buildChartSelection(
    containerSelection: SequenceContainerSelection,
    options: SequenceOptions
  ): SequenceSVGSelection {
    const width = (containerSelection.node() as HTMLElement).offsetWidth;

    return containerSelection
      .append<SVGElement>('svg')
      .classed('sequence-chart-svg', true)
      .attr('width', width)
      .attr('height', options.data.length * options.rowHeight + options.headerHeight + options.margin.top)
      .append<SVGElement>('svg:g')
      .attr('width', width - options.margin.left - options.margin.right)
      .attr('transform', `translate(${options.margin.left}, ${options.margin.top})`);
  }

  private clearSvg(containerSelection: SequenceContainerSelection): void {
    containerSelection.selectAll('svg').remove();
    const sequenceObject = this.getChartFromElement(containerSelection.node()!);
    sequenceObject && sequenceObject.destroy();
  }

  private drawLayout(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.sequenceChartLayoutService.drawLayout(chartSelection, options);
  }

  private drawAxes(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.sequenceChartAxisService.drawAxes(chartSelection, options);
  }

  private drawBars(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.sequenceBarRendererService.drawBars(chartSelection, options);
  }

  private getDefaultOptions(): SequenceOptions {
    return {
      headerHeight: 32,
      rowHeight: 44,
      barHeight: 18,
      unit: undefined,
      margin: {
        top: 0,
        left: 16,
        bottom: 5,
        right: 5
      },
      data: [],
      onSegmentSelected: () => {
        /** NOOP */
      },
      onSegmentHovered: () => {
        /** NOOP */
      },
      onMarkerHovered: () => {
        /** NOOP */
      }
    };
  }
}
