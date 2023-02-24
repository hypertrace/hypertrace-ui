import { forkJoinSafeEmpty, TimeDuration } from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RadarPoint } from '../../../../components/radar/radar';
import { GraphQlTimeRange } from '../../../../graphql/model/schema/timerange/graphql-time-range';
import { GraphQlDataSourceModel } from '../../../data/graphql/graphql-data-source.model';

export abstract class RadarDataSourceModel extends GraphQlDataSourceModel<RadarWidgetDataFetcher> {
  protected abstract fetchData(timeRange: GraphQlTimeRange): Observable<RadarPoint[]>;

  public getData(): Observable<RadarWidgetDataFetcher> {
    return of({
      getData: (previousTimeDuration: TimeDuration) => this.fetchComparisonData(previousTimeDuration)
    });
  }

  protected buildRadarPoint(axis: string, value: number): RadarPoint {
    return {
      axis: axis,
      value: value
    };
  }

  private fetchComparisonData(previousTimeDuration: TimeDuration): Observable<RadarComparisonData> {
    return forkJoinSafeEmpty([this.fetchCurrentData(), this.fetchPreviousData(previousTimeDuration)]).pipe(
      map(combinedData => this.buildComparisonData(combinedData[0], combinedData[1]))
    );
  }

  private fetchCurrentData(): Observable<RadarPoint[]> {
    return this.fetchData(this.getTimeRangeOrThrow());
  }

  private fetchPreviousData(previousTimeDuration: TimeDuration): Observable<RadarPoint[]> {
    return this.fetchData(this.getPreviousTimeRange(previousTimeDuration)).pipe(catchError(() => of([]))); // Show as empty if prior data is not available
  }

  private getPreviousTimeRange(previousTimeDuration: TimeDuration): GraphQlTimeRange {
    const currentTime = this.getTimeRangeOrThrow();
    const compareWithFromDate = new Date(currentTime.from.valueOf() - previousTimeDuration.toMillis());
    const compareWithToDate = new Date(currentTime.to.valueOf() - previousTimeDuration.toMillis());

    return new GraphQlTimeRange(compareWithFromDate, compareWithToDate);
  }

  private buildComparisonData(current: RadarPoint[], previous: RadarPoint[]): RadarComparisonData {
    return {
      current: current,
      previous: previous
    };
  }
}

export interface RadarWidgetDataFetcher {
  getData(comparedWithTimeDuration: TimeDuration): Observable<RadarComparisonData>;
}

export interface RadarComparisonData {
  current: RadarPoint[];
  previous: RadarPoint[];
}
