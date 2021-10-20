import { DateFormatMode, DateFormatter } from '@hypertrace/common';
import { Numeric } from 'd3-array';
import { scaleTime, ScaleTime } from 'd3-scale';
import { ScaleType } from '../../../../chart';
import { D3ScaleForType } from '../../cartesian-scale';
import { CartesianNumericScale } from '../cartesian-numeric-scale';

export class CartesianTimeScale<TData> extends CartesianNumericScale<TData> {
  public d3Implementation!: D3ScaleForType<ScaleType.Time, Numeric>;
  private readonly timeFormatter: DateFormatter = new DateFormatter({
    mode: DateFormatMode.TimeOnly
  });
  private readonly dateFormatter: DateFormatter = new DateFormatter({
    mode: DateFormatMode.MonthAndDayOnly
  });

  public transformDomain(value: Numeric): number {
    return this.d3Implementation(value)!;
  }

  public getTickFormatter(): (value: Numeric) => string {
    const formatter = this.getFormatter();

    return value => formatter.format(value as number | Date);
  }

  public transformDataOrigin(): number {
    return this.getRangeStart();
  }

  public getStartBandwidthAdjustment(): number {
    return -this.getBandwidth() / 2;
  }

  private getFormatter(): DateFormatter {
    const [startDate, endDate] = this.d3Implementation.domain();

    const twoDays = 2 * 24 * 60 * 60 * 1000;

    if (endDate.getTime() - startDate.getTime() > twoDays) {
      return this.dateFormatter;
    }

    return this.timeFormatter;
  }

  public getTickDistance(): number {
    const ticks = this.d3Implementation.ticks();
    const range = this.d3Implementation.range();

    return (range[1] - range[0]) / ticks.length;
  }

  protected setDomain(): void {
    const minMax = this.getMinMax();
    this.d3Implementation.domain(minMax);
  }

  protected setRange(): void {
    this.d3Implementation.rangeRound(this.buildRange());
  }

  protected getEmptyScale(): ScaleTime<number, number> {
    return scaleTime();
  }
}
