import { Injectable, OnDestroy } from '@angular/core';
import { isNil } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PreferenceService, StorageType } from '../preference/preference.service';
// Import {TimeRange} from "./time-range";
import { RelativeTimeRange } from './relative-time-range';
import { TimeRangeService } from './time-range.service';
// Import {TimeDuration} from "./time-duration";

@Injectable({ providedIn: 'root' })
export class PageTimeRangeService implements OnDestroy {
  // TODO change to local
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';
  private readonly pageTimeRanges$: BehaviorSubject<PageTimeRangeMap> = new BehaviorSubject<PageTimeRangeMap>({});

  private readonly destroyed$: Subject<void> = new Subject();

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService
  ) {
    this.preferenceService
      .get<PageTimeRangeMap>(PageTimeRangeService.TIME_RANGE_PREFERENCE_KEY, {}, PageTimeRangeService.STORAGE_TYPE)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(values => {
        // tslint:disable-next-line: no-console
        console.log('stored map emission ', values);
        this.pageTimeRanges$.next(values);
      });
  }

  public getPageTimeRange(path: string): RelativeTimeRange | undefined {
    const pageTimeMap = this.pageTimeRanges$.getValue();

    if (isNil(pageTimeMap[path])) {
      return undefined;
    }

    return this.timeRangeService.timeRangeFromUrlString(pageTimeMap[path]) as RelativeTimeRange;
  }

  public setPageTimeRange(path: string, value: RelativeTimeRange): void {
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
