import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Band, CartesianSelectedData, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<
    MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>
  > = new Subject();

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>
  ): void {
    this.locationChangeSubject.next(data);
  }

  public getLocationChangesForGroup(
    groupId: string
  ): Observable<MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>> {
    return this.locationChangeSubject.asObservable();
  }
}
