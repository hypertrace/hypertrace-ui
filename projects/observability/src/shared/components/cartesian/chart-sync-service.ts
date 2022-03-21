import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Band, CartesianSelectedData, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { CartesianChartComponent } from './cartesian-chart.component';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<ChartHoverData<TData>> = new Subject();

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>,
    groupId?: string,
    chartId?: CartesianChartComponent<TData>
  ): void {
    this.locationChangeSubject.next({
      groupId: groupId,
      locationData: data as MouseLocationData<TData, Series<TData> | Band<TData>>[],
      chartId: chartId
    });
  }

  public getLocationChangesForGroup(chartId: CartesianChartComponent<TData>): Observable<ChartHoverData<TData>> {
    return this.locationChangeSubject.pipe(filter(data => data.chartId !== chartId));
  }
}

interface ChartHoverData<TData> {
  groupId?: string;
  locationData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
  chartId?: CartesianChartComponent<TData>;
}
