import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Band, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> {
  public readonly locationChangeSubject: Subject<
    MouseLocationData<TData, Series<TData> | Band<TData>>[]
  > = new Subject();

  public mouseLocationChange(data: MouseLocationData<TData, Series<TData> | Band<TData>>[]): void {
    this.locationChangeSubject.next(data);
  }
}
