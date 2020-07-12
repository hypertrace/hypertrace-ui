import { Injectable } from '@angular/core';
import { getCoordinateAtAngle, Point } from '@hypertrace/common';
import { Selection } from 'd3-selection';
import { curveLinearClosed, lineRadial, LineRadial } from 'd3-shape';
import { RadarAxisData, RadarChartAxisService } from '../axis/radar-chart-axis.service';
import { RadarLayoutStyleClass, RadarOptions, RadarPoint, RadarSeries, RadarSVGSelection } from '../radar';
import { RadarObject } from '../radar-object';

@Injectable()
export class RadarSeriesRendererService {
  public constructor(private readonly radarChartAxisService: RadarChartAxisService) {}

  public drawSeries(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.drawSeriesPathAndPoints(chartSelection, options);
  }

  private drawSeriesPathAndPoints(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    const axisDataMap = this.radarChartAxisService.getAxisDataMap(chartSelection);
    const plotSelection = chartSelection.select<SVGElement>(`.${RadarLayoutStyleClass.Plot}`);

    const seriesSelections = plotSelection
      .selectAll('.series')
      .data<RadarSeries>(options.series)
      .enter()
      .append('g')
      .attr('class', 'series')
      .on('click', series => options.onSeriesClicked(series.name));

    // Draw Line Path
    this.drawRadialLine(seriesSelections, axisDataMap);

    // Draw Points
    this.drawPoints(seriesSelections, axisDataMap, options.onPointClicked);
  }

  private drawRadialLine(seriesSelections: SeriesSVGGSelection, axisDataMap: Map<string, RadarAxisData>): void {
    seriesSelections
      .append('path')
      .attr('class', 'radar-area')
      .attr('d', series => this.buildRadialLine(axisDataMap)(series.data))
      .style('stroke', series => series.color);
  }

  private drawPoints(
    seriesSelections: SeriesSVGGSelection,
    axisDataMap: Map<string, RadarAxisData>,
    onPointClicked: (point: RadarPoint, seriesName: string) => void
  ): void {
    const pointsSelection = seriesSelections
      .filter(series => series.showPoints)
      .append('g')
      .classed('points', true)
      .attr('fill', series => series.color)
      .attr('stroke', series => series.color);

    pointsSelection
      .selectAll('.point')
      .data(series => this.buildPointSelectionData(series, axisDataMap))
      .enter()
      .append('circle')
      .classed('point', true)
      .on('click', selectionData => onPointClicked(selectionData.radarPoint, selectionData.seriesName))
      .attr('cx', selectionData => selectionData.coordinates.x)
      .attr('cy', selectionData => selectionData.coordinates.y)
      .attr('r', 5);
  }

  private buildRadialLine(axisDataMap: Map<string, RadarAxisData>): LineRadial<RadarPoint> {
    return lineRadial<RadarPoint>()
      .curve(curveLinearClosed)
      .radius(datum => {
        const axisData = axisDataMap.get(datum.axis)!;

        return axisData.scale(datum.value);
      })
      .angle(datum => {
        const axisData = axisDataMap.get(datum.axis)!;

        return axisData.axisRadian;
      });
  }

  private getPointCoordinates(axisData: RadarAxisData, radarPoint: RadarPoint): Point {
    const distance = axisData.scale(radarPoint.value);
    const angle = axisData.axisRadian;

    return getCoordinateAtAngle(distance, angle);
  }

  private buildPointSelectionData(series: RadarSeries, axisDataMap: Map<string, RadarAxisData>): PointSelectionData[] {
    return series.data.map(radarPoint => {
      const axisData = axisDataMap.get(radarPoint.axis)!;

      return {
        radarPoint: radarPoint,
        seriesName: series.name,
        axisData: axisData,
        coordinates: this.getPointCoordinates(axisData, radarPoint)
      };
    });
  }
}

type SeriesSVGGSelection = Selection<SVGGElement, RadarSeries, SVGElement, RadarObject>;

interface PointSelectionData {
  radarPoint: RadarPoint;
  axisData: RadarAxisData;
  seriesName: string;
  coordinates: Point;
}
