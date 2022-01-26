import { NumericFormatter } from '@hypertrace/common';
import { Numeric } from 'd3-array';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { AxisType, ScaleType } from '../../../../chart';
import { D3ScaleForType } from '../../cartesian-scale';
import { CartesianNumericScale } from '../cartesian-numeric-scale';

export class CartesianContinuousScale<TData> extends CartesianNumericScale<TData> {
  public d3Implementation!: D3ScaleForType<ScaleType.Linear, number>;
  private readonly numberFormatter: NumericFormatter = new NumericFormatter();

  public transformDomain(value: number): number {
    return this.d3Implementation(value)!;
  }

  public getTickFormatter(): (value: Numeric) => string {
    return (value: Numeric) => this.numberFormatter.format(value.valueOf());
  }

  public getTickDistance(): number {
    const ticks = this.d3Implementation.ticks();
    const length = ticks.length;

    return this.d3Implementation(ticks[length - 1])! - this.d3Implementation(ticks[length - 2])!;
  }

  public transformDataOrigin(datum: TData): number {
    if (this.axisType === AxisType.Y && this.initData.seriesState) {
      const baseline = this.initData.seriesState.getBaseline(datum);
      if (baseline !== undefined) {
        return this.transformDomain(baseline);
      }
    }

    return this.getRangeStart();
  }

  protected setDomain(): void {
    const minMax = this.getMinMax();
    this.d3Implementation.domain(minMax).nice();
  }

  protected setRange(): void {
    this.d3Implementation.range(this.buildRange());
  }

  protected getEmptyScale(): ScaleLinear<number, number> {
    return scaleLinear();
  }
}
