import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Band, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { CartesianHoverData } from './chart-interactivty';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  private readonly locationChangeSubject: Subject<
    MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianHoverData<TData>
  > = new Subject();

  public locationChange$: Observable<
    MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianHoverData<TData>
  > = this.locationChangeSubject.asObservable();

  public mouseLocationChange(
    data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianHoverData<TData>
  ): void {
    this.locationChangeSubject.next(data);
  }
}
