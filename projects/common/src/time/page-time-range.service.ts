import { Injectable, OnDestroy } from '@angular/core';
import { isNil } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, share, takeUntil } from 'rxjs/operators';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { TimeRange } from './time-range';
// Import {TimeRange} from "./time-range";
import { TimeRangeService } from './time-range.service';
// Import {TimeDuration} from "./time-duration";

@Injectable({ providedIn: 'root' })
export class PageTimeRangeService implements OnDestroy {
  // TODO change to local ??
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';
  private readonly destroyed$: Subject<void> = new Subject();

  private readonly pageTimeRanges$: BehaviorSubject<PageTimeRangeMap> = new BehaviorSubject<PageTimeRangeMap>({});
  private readonly storedTimeRanges$: Observable<PageTimeRangeMap> = this.preferenceService
    .get<PageTimeRangeMap>(PageTimeRangeService.TIME_RANGE_PREFERENCE_KEY, {}, PageTimeRangeService.STORAGE_TYPE)
    .pipe(takeUntil(this.destroyed$));

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService
  ) {
    this.storedTimeRanges$.subscribe(values => {
      this.pageTimeRanges$.next(values);
    });
  }

  public getPageTimeRange(path: string): Observable<TimeRange | undefined> {
    return this.storedTimeRanges$.pipe(
      distinctUntilChanged((prev, curr) => prev[path] === curr[path]),
      map(timeRanges =>
        !isNil(timeRanges[path]) ? this.timeRangeService.timeRangeFromUrlString(timeRanges[path]) : undefined
      ),
      share()
    );
  }

  public setPageTimeRange(path: string, value: TimeRange): void {
    const pageTimeMap: PageTimeRangeMap = this.pageTimeRanges$.getValue();

    const newMap: PageTimeRangeMap = { ...pageTimeMap, [path]: value.toUrlString() };

    this.preferenceService.set(
      PageTimeRangeService.TIME_RANGE_PREFERENCE_KEY,
      newMap,
      PageTimeRangeService.STORAGE_TYPE
    );
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

interface PageTimeRangeMap {
  [path: string]: string;
}
