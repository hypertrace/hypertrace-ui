import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Band, Series } from '../../../public-api';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';

@Injectable({ providedIn: 'root' })
export class ChartSyncService<TData> implements OnDestroy {
  public readonly locationChangeSubject: Subject<
    MouseLocationData<TData, Series<TData> | Band<TData>>[]
  > = new Subject();

  public mouseLocationChange(data: MouseLocationData<TData, Series<TData> | Band<TData>>[]): void {
    this.locationChangeSubject.next(data);
  }

  public ngOnDestroy(): void {
    this.locationChangeSubject.complete();
  }
}
