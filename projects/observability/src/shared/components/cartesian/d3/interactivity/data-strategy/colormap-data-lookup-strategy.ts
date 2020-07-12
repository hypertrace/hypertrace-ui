import { select } from 'd3-selection';

import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../../chart';
import { AnyCartesianScale } from '../../scale/cartesian-scale-builder';

export class ColormapDataLookupStrategy<TData> implements MouseDataLookupStrategy<TData, Series<TData>> {
  private readonly colorMap: Map<string, MouseLocationData<TData, Series<TData>>> = new Map();
  private readonly colorPickerContext: CanvasRenderingContext2D;
  private lastColorSeed: number = 0;

  public constructor(
    private readonly xScale: AnyCartesianScale<TData>,
    private readonly yScale: AnyCartesianScale<TData>,
    visualization: ColorMappableSeriesVisualization<TData>
  ) {
    this.colorPickerContext = this.createColorContext();

    visualization.drawCanvasToColorMap(this.colorPickerContext, this.colorForData.bind(this));
  }

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, Series<TData>>[] {
    const color = this.colorPickerContext.getImageData(location.x, location.y, 1, 1).data;
    const locationDatum = this.colorMap.get(this.colorArrayToString(color));

    return locationDatum === undefined ? [] : [locationDatum];
  }

  private createColorContext(): CanvasRenderingContext2D {
    // The size of the data area is the range dimensions, but may be offset by axes
    // Add a bit of buffer to account for this - the canvas just needs to be big enough
    const height = Math.abs(this.yScale.getRangeStart() - this.yScale.getRangeEnd()) + 500;
    const width = Math.abs(this.xScale.getRangeStart() - this.xScale.getRangeEnd()) + 500;
    const detachedCanvas = select(document.createElement('canvas'))
      .append('canvas')
      .attr('width', width)
      .attr('height', height)
      .node()!;

    return detachedCanvas.getContext('2d')!;
  }

  private colorForData(data: TData, series: Series<TData>): string {
    const color = this.getNextColor();
    this.addDataToColorMap(color, data, series);

    return `rgb(${color})`;
  }

  private addDataToColorMap(color: string, data: TData, series: Series<TData>): void {
    this.colorMap.set(color, {
      dataPoint: data,
      context: series,
      location: this.domainCoordinatesToLocationCoordinates(data)
    });
  }

  private colorArrayToString(colorArray: Uint8ClampedArray): string {
    return colorArray.slice(0, 3).toString();
  }

  private domainCoordinatesToLocationCoordinates(data: TData): RelativeMouseLocation {
    return {
      x: this.xScale.transformToTooltipAnchor(data),
      y: this.yScale.transformToTooltipAnchor(data)
    };
  }

  private getNextColor(): string {
    const colorSeed = this.lastColorSeed + 5;
    this.lastColorSeed = colorSeed;

    return `${colorSeed % 256},${Math.floor(colorSeed / 256) % 256},${Math.floor(colorSeed / 65536) % 256}`;
  }
}

export type ColorMappingFunction<TData> = (data: TData, series: Series<TData>) => string;

export interface ColorMappableSeriesVisualization<TData> {
  drawCanvasToColorMap(context: CanvasRenderingContext2D, colorFn: ColorMappingFunction<TData>): void;
}
