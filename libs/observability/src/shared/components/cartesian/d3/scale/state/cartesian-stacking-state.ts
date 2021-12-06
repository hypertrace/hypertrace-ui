import { Dictionary } from '@hypertrace/common';
import { Numeric } from 'd3-array';
import { stack, stackOffsetNone, stackOrderNone } from 'd3-shape';
import { Series } from '../../../chart';
import { SeriesState } from './series-state';

export class CartesianStackingState<TData> implements SeriesState<TData> {
  protected baselineMap: Map<TData, number> = new Map();
  protected maxValue: number = 0;

  public constructor(
    protected readonly stackingSeriesList: Series<TData>[],
    protected readonly xDataAccessor: (data: TData) => XValue,
    protected readonly yDataAccessor: (data: TData) => YValue
  ) {
    this.transformToStackData();
  }

  public getBaseline(datum: TData): number | undefined {
    return this.baselineMap.get(datum);
  }

  public getMaxValue(): number {
    return this.maxValue;
  }

  private transformToStackData(): void {
    const dataMap: Map<XValueAsNumber, Dictionary<YValue>> = this.buildDataMap();
    const mergedSeriesData: Dictionary<YValue>[] = this.buildMergedSeriesData(dataMap);

    const dataset = stack()
      .keys(this.stackingSeriesList.map(series => series.name))
      .order(stackOrderNone)
      .offset(stackOffsetNone)(mergedSeriesData);

    this.stackingSeriesList.forEach((series, index) => {
      series.data.forEach((datum: TData, dataIndex) => {
        this.baselineMap.set(datum, dataset[index][dataIndex][0]);
        this.maxValue = Math.max(this.maxValue, dataset[index][dataIndex][1]);
      });
    });
  }

  private buildDataMap(): Map<XValueAsNumber, Dictionary<YValue>> {
    const dataMap: Map<XValueAsNumber, Dictionary<YValue>> = new Map();

    this.stackingSeriesList.forEach(series =>
      series.data.forEach(datum => {
        let dataPoint: Dictionary<YValue>;
        const xValueNumber = this.xDataAccessor(datum).valueOf();

        if (dataMap.has(xValueNumber)) {
          dataPoint = dataMap.get(xValueNumber)!;
        } else {
          dataPoint = {};
          dataMap.set(xValueNumber, dataPoint);
        }

        dataPoint[`${series.name}`] = this.yDataAccessor(datum);
      })
    );

    return dataMap;
  }

  private buildMergedSeriesData(dataMap: Map<XValueAsNumber, Dictionary<YValue>>): Dictionary<YValue>[] {
    const mergedSeriesData: Dictionary<YValue>[] = [];

    Array.from(dataMap.keys())
      .sort((key1, key2) => key1 - key2)
      .forEach(key => {
        mergedSeriesData.push(dataMap.get(key)!);
      });

    return mergedSeriesData;
  }
}

type XValue = Numeric;
type XValueAsNumber = number;
type YValue = number;
