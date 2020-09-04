import { Injectable } from '@angular/core';
import { extent } from 'd3-array';
import { Axis, AxisScale, axisTop } from 'd3-axis';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { BaseType } from 'd3-selection';
import { SequenceLayoutStyleClass, SequenceOptions, SequenceSegment, SequenceSVGSelection } from '../sequence';

@Injectable()
export class SequenceChartAxisService {
  public drawAxes(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.buildAxis(chartSelection, options);
  }

  public updateScaleDomainAndTickSize(
    chartSelection: SequenceSVGSelection,
    options: SequenceOptions
  ): ScaleLinear<number, number> {
    this.updateTickSize(chartSelection, options);
    const updatedScale = this.updateScale(chartSelection, options);

    return updatedScale;
  }

  protected buildAxis(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    const axisSelection = chartSelection.selectAll<SVGGElement, Axis<number>>(`.${SequenceLayoutStyleClass.Axis}`);

    const axisWidth = Number(axisSelection.attr('width'));
    const chartHeight = Number(chartSelection.attr('height'));

    const xScale = this.buildScale(0, axisWidth - 100, options.data);
    const d3Axis = axisTop(xScale);

    d3Axis
      .tickSize(-1 * chartHeight)
      .ticks(4)
      .tickFormat(domain => `${domain}${options.unit !== undefined ? options.unit : ''}`)
      .tickPadding(12);

    axisSelection.data([d3Axis]);

    axisSelection
      .call(d3Axis)
      .classed('axis-line', true)
      .classed('divider-line', (_datum, index) => index === 0)
      .on('mouseleave', () => options.onSegmentHovered(undefined));

    // Draw Bar elements
    const axisHeaderSelection = axisSelection.selectAll<BaseType, SequenceSegment>('g.bar').data([options.data]);

    axisHeaderSelection.exit().remove();

    axisHeaderSelection
      .enter()
      .insert('svg:rect', 'path')
      .classed('axis-header', true)
      .merge(axisHeaderSelection)
      .attr('transform', () => `translate(0, ${-options.headerHeight})`)
      .attr('height', options.headerHeight)
      .attr('x', -14)
      .attr('width', '100%');
  }

  private buildScale(rangeMin: number, rangeMax: number, data: SequenceSegment[]): AxisScale<number> {
    const scale = this.buildLinearScale(rangeMin, rangeMax);
    if (data.length > 0) {
      this.setDomain(scale, data);
    }

    return scale as AxisScale<number>;
  }

  private buildLinearScale(rangeMin: number, rangeMax: number): ScaleLinear<number, number> {
    return scaleLinear().range([rangeMin, rangeMax]).nice();
  }

  private updateTickSize(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    const axisSelection = chartSelection.selectAll<SVGGElement, Axis<number>>(`.${SequenceLayoutStyleClass.Axis}`);
    const xAxis = axisSelection.datum();

    xAxis.tickSize(-1 * (options.data.length * options.rowHeight));

    axisSelection.data([xAxis]);

    axisSelection.call(xAxis);
  }

  private updateScale(chartSelection: SequenceSVGSelection, options: SequenceOptions): ScaleLinear<number, number> {
    const axisSelection = chartSelection.selectAll<SVGGElement, Axis<number>>(`.${SequenceLayoutStyleClass.Axis}`);
    const xAxis = axisSelection.datum();

    const xScale = xAxis.scale<ScaleLinear<number, number>>();
    this.setDomain(xScale, options.data);

    return xScale;
  }

  private setDomain(scale: ScaleLinear<number, number>, data: SequenceSegment[]): void {
    const domain = extent(data.map(dataRow => [dataRow.start, dataRow.end]).flat()) as [number, number];
    scale.domain(domain);
  }
}
