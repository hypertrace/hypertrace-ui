import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Band, CartesianSelectedData, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<{
    groupId?: string;
    locationData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
  }> = new Subject();

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>,
    groupId?: string
  ): void {
    this.locationChangeSubject.next({
      groupId: groupId,
      locationData: data as MouseLocationData<TData, Series<TData> | Band<TData>>[]
    });
  }

  public getLocationChangesForGroup(
    _groupId: string
  ): Observable<MouseLocationData<TData, Series<TData> | Band<TData>>[]> {
    return this.locationChangeSubject.pipe(map(data => this.filterArray(data)));
  }

  private filterArray(data: {
    groupId?: string;
    locationData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
  }): MouseLocationData<TData, Series<TData> | Band<TData>>[] {
    return data.locationData;
  }
}
