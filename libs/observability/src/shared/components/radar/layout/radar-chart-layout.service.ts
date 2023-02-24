import { Injectable } from '@angular/core';
import { LegendPosition } from '../../legend/legend.component';
import { RadarLayoutStyleClass, RadarOptions, RadarSVGSelection } from '../radar';

@Injectable()
export class RadarChartLayoutService {
  public drawLayout(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.buildPlotSection(chartSelection, options);
    this.buildLegendSection(chartSelection, options);
  }

  private buildPlotSection(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    const chartWidth = Number(chartSelection.attr('width'));
    const chartHeight = Number(chartSelection.attr('height'));

    const plotWidth = chartWidth - options.plotMargin.left - options.plotMargin.right;
    const plotHeight = chartHeight - options.plotMargin.top - options.plotMargin.bottom - this.getLegendHeight(options);

    const plotDimension = {
      width: plotWidth,
      height: plotHeight,
      position: {
        x: 0,
        y: -(chartHeight - plotHeight) / 2
      }
    };

    const plotSelection = this.addSection(chartSelection, plotDimension, RadarLayoutStyleClass.Plot);

    this.buildAxisSection(plotSelection);
  }

  private buildAxisSection(plotSelection: RadarSVGSelection): void {
    const plotWidth = Number(plotSelection.attr('width'));
    const plotHeight = Number(plotSelection.attr('height'));

    const axisDimension = {
      width: plotWidth,
      height: plotHeight,
      position: {
        x: 0,
        y: 0
      }
    };

    this.addSection(plotSelection, axisDimension, RadarLayoutStyleClass.Axis);
  }

  private buildLegendSection(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    const chartWidth = Number(chartSelection.attr('width'));
    const chartHeight = Number(chartSelection.attr('height'));

    const legendHeight = this.getLegendHeight(options);
    const axisDimension = {
      width: chartWidth,
      height: legendHeight,
      position: {
        x: 0,
        y: chartHeight / 2 - legendHeight
      }
    };

    this.addSection(chartSelection, axisDimension, RadarLayoutStyleClass.Legend);
  }

  private addSection(parent: RadarSVGSelection, dimension: SectionDimension, className: string): RadarSVGSelection {
    const childSection = parent
      .append<SVGElement>('svg:g')
      .attr('width', dimension.width)
      .attr('height', dimension.height)
      .classed(className, true)
      .attr('transform', `translate(${dimension.position.x}, ${dimension.position.y})`);

    return childSection;
  }

  private getLegendHeight(options: RadarOptions): number {
    return options.legendPosition !== LegendPosition.None ? options.legendHeight : 0;
  }
}

interface SectionDimension {
  position: Position;
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}
