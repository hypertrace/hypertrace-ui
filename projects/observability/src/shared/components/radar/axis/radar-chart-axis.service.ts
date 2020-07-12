import { Injectable } from '@angular/core';
import { getCoordinateAtAngle } from '@hypertrace/common';
import { max, range } from 'd3-array';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { SvgUtilService } from '../../utils/svg/svg-util.service';
import { RadarLayoutStyleClass, RadarOptions, RadarSVGSelection } from '../radar';
import { RadarObject } from '../radar-object';

@Injectable()
export class RadarChartAxisService {
  public constructor(private readonly svgUtilService: SvgUtilService) {}

  public drawAxes(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.buildAxis(chartSelection, options);
  }

  public getAxisData(chartSelection: RadarSVGSelection, axisName: string): RadarAxisData | undefined {
    const axisDataMap = this.getAxisDataMap(chartSelection);

    return axisDataMap.get(axisName);
  }

  public getAxisDataMap(chartSelection: RadarSVGSelection): Map<string, RadarAxisData> {
    const axesSelection = chartSelection.selectAll<SVGGElement, Map<string, RadarAxisData>>(
      `.${RadarLayoutStyleClass.Axis}`
    );

    return axesSelection.datum();
  }

  protected buildAxis(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    const axesSelection = chartSelection.selectAll<SVGGElement, Map<string, RadarAxisData>>(
      `.${RadarLayoutStyleClass.Axis}`
    );

    this.setAxisData(axesSelection, options);
    this.drawTickCircles(axesSelection, options);
    this.drawRadianAxis(axesSelection, options);
  }

  private drawTickCircles(axesSelection: AxesGSelection, options: RadarOptions): void {
    const axisWidth = Number(axesSelection.attr('width'));
    const axisHeight = Number(axesSelection.attr('height'));

    const maxRadius = Math.min(axisWidth / 2, axisHeight / 2);

    axesSelection
      .selectAll('.grid-circle')
      .data(range(1, options.levels + 1))
      .enter()
      .append('g')
      .classed('dotted-grid-circle', (_, index) => index !== options.levels - 1)
      .classed('last-grid-circle', (_, index) => index === options.levels - 1)
      .append('circle')
      .classed('circle-path', true)
      .attr('r', level => (maxRadius / options.levels) * level);
  }

  private drawRadianAxis(axesSelection: AxesGSelection, options: RadarOptions): void {
    const axisDataMap = axesSelection.datum();
    const totalWidth = Number(axesSelection.attr('width'));

    // Create the radial axis lines
    const axis = axesSelection
      .selectAll('.axis')
      .data(options.axes.map(axisName => axisDataMap.get(axisName.name)!))
      .enter()
      .append('g')
      .classed('axis', true);

    // Append the lines
    axis
      .append('line')
      .datum(axisData => getCoordinateAtAngle(axisData.scale.range()[1], axisData.axisRadian))
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', position => position.x)
      .attr('y2', position => position.y)
      .classed('line', true);

    // Append the labels at each axis
    axis
      .append('text')
      .text(axisData => axisData.axisName)
      .each((axisData, index, groups) => {
        const thisElement = groups[index];
        const radius = axisData.scale.range()[1];
        const axisTitlePadding = 8;
        const titlePosition = getCoordinateAtAngle(radius + axisTitlePadding, axisData.axisRadian);
        select(thisElement).attr('x', titlePosition.x).attr('y', titlePosition.y);

        this.svgUtilService.wrapTextIfNeeded(
          thisElement,
          this.getAvailableTextWidth(axisData.axisRadian, titlePosition.x + totalWidth / 2, totalWidth)
        );
      })
      .classed('axis-title', true)
      .attr('dominant-baseline', axisData => this.getTextBaseline(axisData.axisRadian))
      .attr('text-anchor', axisData => this.getTextAnchor(axisData.axisRadian));
  }

  private setAxisData(axesSelection: AxesGSelection, options: RadarOptions): void {
    const axisWidth = Number(axesSelection.attr('width'));
    const axisHeight = Number(axesSelection.attr('height'));
    const axisDataMap = new Map<string, RadarAxisData>();
    const rangeStart = 0;
    const rangeEnd = Math.min(axisWidth / 2, axisHeight / 2);

    options.axes.forEach((axis, index) => {
      const maxAxisValue = this.getMaxAxisValue(axis.name, options)!;
      const scale = this.buildScale(rangeStart, rangeEnd, maxAxisValue, options.levels);

      axisDataMap.set(axis.name, {
        scale: scale,
        axisName: axis.name,
        axisRadian: ((Math.PI * 2) / options.axes.length) * index // 0 is at 12'o clock
      });
    });

    axesSelection.datum(axisDataMap);
  }

  private buildScale(
    rangeMin: number,
    rangeMax: number,
    maxAxisValue: number,
    levels: number
  ): ScaleLinear<number, number> {
    const scale = scaleLinear().range([rangeMin, rangeMax]);
    this.setDomain(scale, maxAxisValue, levels);

    return scale;
  }

  private setDomain(scale: ScaleLinear<number, number>, maxValue: number, levels: number): void {
    const step = maxValue / (levels - 1);

    scale.domain([0, step * levels]);
  }

  private getMaxAxisValue(axisName: string, options: RadarOptions): number | undefined {
    return max(
      options.series.flatMap(series => series.data.filter(datum => datum.axis === axisName).map(datum => datum.value))
    );
  }

  private getTextAnchor(angle: number): string {
    if (this.isAxisTitleOnLeft(angle)) {
      return 'end';
    }

    if (this.isAxisTitleOnRight(angle)) {
      return 'start';
    }

    return 'middle';
  }

  private getAvailableTextWidth(angle: number, xPosition: number, totalWidth: number): number {
    if (this.isAxisTitleOnLeft(angle)) {
      return xPosition;
    }

    if (this.isAxisTitleOnRight(angle)) {
      return totalWidth - xPosition;
    }

    return totalWidth;
  }

  private getTextBaseline(angle: number): string {
    if (this.isAxisTitleBelowCenter(angle)) {
      return 'hanging';
    }

    if (this.isAxisTitleAboveCenter(angle)) {
      return 'baseline';
    }

    return 'center';
  }

  private isAxisTitleBelowCenter(angle: number): boolean {
    return angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
  }

  private isAxisTitleAboveCenter(angle: number): boolean {
    return (angle > (3 * Math.PI) / 2 && angle < 2 * Math.PI) || (angle > 0 && angle < Math.PI / 2);
  }

  private isAxisTitleOnLeft(angle: number): boolean {
    return angle > Math.PI && angle < 2 * Math.PI;
  }

  private isAxisTitleOnRight(angle: number): boolean {
    return angle > 0 && angle < Math.PI;
  }
}

export interface RadarAxisData {
  axisName: string;
  axisRadian: number;
  scale: ScaleLinear<number, number>;
}

type AxesGSelection = Selection<SVGGElement, Map<string, RadarAxisData>, SVGElement, RadarObject>;
