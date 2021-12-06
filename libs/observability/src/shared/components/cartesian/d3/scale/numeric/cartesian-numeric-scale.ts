import { extent, Numeric } from 'd3-array';
import { compact, uniq } from 'lodash-es';
import { AxisType } from '../../../chart';
import { CartesianScale } from '../cartesian-scale';
import { SeriesState } from '../state/series-state';
export abstract class CartesianNumericScale<TData> extends CartesianScale<TData, Numeric> {
  protected abstract getTickDistance(): number;

  public getBandwidth(): number {
    const closestDistance = this.getClosestDistance();
    const dataPointWidth = Math.min(this.getTickDistance(), closestDistance) - 2;

    return dataPointWidth > 0 ? dataPointWidth : 1;
  }

  protected getMinMax(): [Numeric, Numeric] {
    const data = this.getDataValues();
    const dataMinMax = this.getMinAndMaxFromData(data, this.initData.seriesState);
    const axisMinMax = [this.initData.min as Numeric, this.initData.max as Numeric];

    return extent([...axisMinMax, ...dataMinMax]) as [Numeric, Numeric];
  }

  private getMinAndMaxFromData(seriesData: Numeric[], seriesState?: SeriesState<TData>): [Numeric, Numeric] {
    const data = seriesData;
    if (this.axisType === AxisType.Y) {
      // 0 as minimum domain always
      data.push(0);
    }

    if (this.axisType === AxisType.Y && seriesState) {
      data.push(seriesState.getMaxValue());
    }

    const [dataMin, dataMax] = extent(data);
    const min = dataMin === undefined ? 0 : dataMin;
    const max = dataMax === undefined || dataMax.valueOf() === 0 ? 1 : dataMax;

    return [min, max];
  }

  private getDataValues(): Numeric[] {
    return uniq(
      this.initData.allSeriesAndBandSeries.flatMap(series => series.data).map(datum => this.getValueFromData(datum))
    );
  }

  private getClosestDistance(): number {
    return Math.min(
      ...compact(
        uniq(
          this.initData.allSeriesAndBandSeries.flatMap(series => series.data).map(datum => this.transformData(datum))
        )
          .sort((xValue1, xValue2) => xValue1 - xValue2)
          .map((xValue, index, arr) => (index !== 0 ? xValue - arr[index - 1] : undefined))
      )
    );
  }
}
