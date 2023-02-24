import { Injectable } from '@angular/core';
import { SequenceLayoutStyleClass, SequenceOptions, SequenceSVGSelection } from '../sequence';

@Injectable()
export class SequenceChartLayoutService {
  public drawLayout(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    this.buildAxisSection(chartSelection, options);
    this.buildDataBarSection(chartSelection, options);
  }

  private buildAxisSection(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    const chartWidth = Number(chartSelection.attr('width'));

    const axisDimension = {
      width: chartWidth,
      position: {
        x: 0,
        y: options.headerHeight
      }
    };

    this.addSection(chartSelection, axisDimension, SequenceLayoutStyleClass.Axis);
  }

  private buildDataBarSection(chartSelection: SequenceSVGSelection, options: SequenceOptions): void {
    const chartWidth = Number(chartSelection.attr('width'));

    const axisDimension = {
      width: chartWidth,
      position: {
        x: 0,
        y: options.headerHeight
      }
    };

    this.addSection(chartSelection, axisDimension, SequenceLayoutStyleClass.Plot);
  }

  private addSection(
    parent: SequenceSVGSelection,
    dimension: SectionDimension,
    className: string
  ): SequenceSVGSelection {
    const childSection = parent
      .append<SVGElement>('svg:g')
      .attr('width', dimension.width)
      .classed(className, true)
      .attr('transform', `translate(${dimension.position.x}, ${dimension.position.y})`);

    return childSection;
  }
}

interface SectionDimension {
  position: Position;
  width: number;
}

interface Position {
  x: number;
  y: number;
}
