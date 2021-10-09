import { ScaleBand, scaleBand } from 'd3-scale';
import { uniq } from 'lodash-es';
import { ScaleType } from '../../../chart';
import { CartesianScale, D3ScaleForType } from '../cartesian-scale';

export class CartesianBandScale<TData> extends CartesianScale<TData, string> {
  public d3Implementation!: D3ScaleForType<ScaleType.Band, string>;

  public transformDomain(value: string): number {
    return this.d3Implementation(value)!;
  }
  public transformToTooltipAnchor(value: TData): number {
    return this.transformDomain(this.getValueFromData(value)) + this.getBandwidth() / 2;
  }

  public getTickFormatter(): (value: string) => string {
    return (value: string) => value;
  }

  public getBandwidth(): number {
    return this.d3Implementation.bandwidth();
  }

  public transformDataOrigin(): number {
    return this.getRangeStart();
  }

  protected setDomain(): void {
    this.d3Implementation.domain(
      uniq(
        this.initData.allSeriesAndBandSeries.flatMap(series => series.data).map(datum => this.getValueFromData(datum))
      )
    );
  }

  protected setRange(): void {
    this.d3Implementation.range(this.buildRange());
  }

  protected getEmptyScale(): ScaleBand<string> {
    return scaleBand().paddingInner(0.2).paddingOuter(0.1).align(1);
  }

  public invert(point: number): number {
    return point;
  }
}
