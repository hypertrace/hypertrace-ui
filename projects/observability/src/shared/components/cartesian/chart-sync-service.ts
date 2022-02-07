import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Band, CartesianSelectedData, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<
    MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>
  > = new Subject();

  private groupId?: string;

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>,
    groupId?: string
  ): void {
    this.locationChangeSubject.next(data);
    this.groupId = groupId;
  }

  public getLocationChangesForGroup(
    groupId: string
  ): Observable<MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianSelectedData<TData>> {
    let selectedData = this.locationChangeSubject.pipe(
      switchMap(async results => results),
      filter(_result => this.groupId === groupId)
    );

    return selectedData;
  }
}
