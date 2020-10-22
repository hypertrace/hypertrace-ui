import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IntervalDurationService, TimeDuration, TypedSimpleChanges } from '@hypertrace/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IntervalValue } from '../../interval-select/interval-select.component';

@Component({
  selector: 'ht-explore-query-interval-editor',
  styleUrls: ['./explore-query-interval-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="interval-container">
      <span class="interval-label"> Interval </span>
      <ht-interval-select
        [interval]="this.selectedInterval$ | async"
        [intervalOptions]="this.intervalOptions$ | async"
        (intervalChange)="this.onIntervalChange($event)"
      >
      </ht-interval-select>
    </div>
  `
})
export class ExploreQueryIntervalEditorComponent implements OnChanges {
  @Input()
  public interval?: IntervalValue;

  @Output()
  public readonly intervalChange: EventEmitter<IntervalValue> = new EventEmitter();

  public readonly intervalOptions$: Observable<IntervalValue[]>;

  public readonly selectedInterval$: Observable<IntervalValue>;

  private readonly intervalInputSubject: Subject<IntervalValue> = new BehaviorSubject<IntervalValue>('NONE');

  public constructor(private readonly intervalDurationService: IntervalDurationService) {
    let autoDuration: TimeDuration | undefined;
    this.intervalOptions$ = intervalDurationService.availableIntervals$.pipe(
      map((concreteIntervals): IntervalValue[] => ['NONE', 'AUTO', ...concreteIntervals])
    );

    this.selectedInterval$ = combineLatest([this.intervalOptions$, this.intervalInputSubject]).pipe(
      map(([availableIntervals, requestedInterval]) => {
        const oldAutoDuration = autoDuration || intervalDurationService.getAutoDuration();
        autoDuration = intervalDurationService.getAutoDuration();
        const match = this.getBestIntervalMatch(availableIntervals, requestedInterval);

        // Either a change in value through matching, or it remains AUTO but auto length has changed
        if (
          !isEqual(requestedInterval, match) ||
          (requestedInterval === 'AUTO' && !autoDuration.equals(oldAutoDuration))
        ) {
          this.onIntervalChange(match);
        }

        return match;
      })
    );
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.interval) {
      this.intervalInputSubject.next(this.interval || 'NONE');
    }
  }

  public onIntervalChange(newInterval: IntervalValue): void {
    this.intervalChange.emit(newInterval);
  }

  private getBestIntervalMatch(options: IntervalValue[], request: IntervalValue): IntervalValue {
    // Maintain AUTO/NONE if requested
    if (typeof request === 'string') {
      return request;
    }

    // If an explicit time, try to match it, otherwise switch to auto
    const match = this.intervalDurationService.getExactMatch(
      request,
      options.filter((option): option is TimeDuration => option instanceof TimeDuration)
    );

    return match || 'AUTO';
  }
}
