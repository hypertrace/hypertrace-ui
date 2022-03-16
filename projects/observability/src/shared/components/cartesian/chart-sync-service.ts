import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Band, CartesianSelectedData, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<ChartHoverData<TData>> = new Subject();

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>,
    groupId?: string
  ): void {
    this.locationChangeSubject.next({
      groupId: groupId,
      locationData: data as MouseLocationData<TData, Series<TData> | Band<TData>>[]
    });
  }

  public getLocationChangesForGroup(groupId: string): Observable<ChartHoverData<TData>> {
    return this.locationChangeSubject.pipe(filter(data => data.groupId === groupId));
  }
}

interface ChartHoverData<TData> {
  groupId?: string;
  locationData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
}
