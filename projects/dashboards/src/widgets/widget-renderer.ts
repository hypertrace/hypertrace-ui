import { ChangeDetectorRef, Directive, Inject, OnDestroy, OnInit } from '@angular/core';
import { FixedTimeRange, TimeRange } from '@hypertrace/common';
import { TimeRange as DashboardTimeRange } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, Subject } from 'rxjs';
import { shareReplay, takeUntil, tap } from 'rxjs/operators';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class WidgetRenderer<TModel extends object, TData = unknown> implements OnInit, OnDestroy {
  public readonly model: TModel;
  public timeRange?: TimeRange;

  public data$?: Observable<TData>;

  private readonly destroyedSubject: Subject<void> = new Subject();
  protected readonly destroyed$: Observable<void> = this.destroyedSubject.asObservable();

  public constructor(
    @Inject(RENDERER_API) public readonly api: RendererApi<TModel>,
    protected readonly changeDetector: ChangeDetectorRef
  ) {
    this.model = api.model;
    const dashboardTimeRange = api.getTimeRange();
    if (dashboardTimeRange) {
      this.timeRange = this.convertFromDashboardTimeRange(dashboardTimeRange);
    }
  }

  public ngOnInit(): void {
    this.fetchAndRunChangeDetection();
    this.api.dataRefresh$.subscribe(() => this.onDashboardRefresh());
    this.api.timeRangeChanged$.subscribe(timeRange => this.onTimeRangeChange(timeRange));
  }

  public ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }

  protected abstract fetchData(): Observable<TData>;

  protected onTimeRangeChange(timeRange: DashboardTimeRange): void {
    this.timeRange = this.convertFromDashboardTimeRange(timeRange);
    this.fetchAndRunChangeDetection();
  }

  protected onDashboardRefresh(): void {
    this.fetchAndRunChangeDetection();
  }

  protected convertFromDashboardTimeRange(timeRange: DashboardTimeRange): TimeRange {
    return new FixedTimeRange(timeRange.startTime, timeRange.endTime);
  }

  private fetchAndRunChangeDetection(): void {
    this.data$ = this.fetchData().pipe(
      shareReplay(),
      takeUntil(this.destroyed$),
      tap(() => this.changeDetector.markForCheck())
    );

    // Mark for check because the observable data$ has been reassigned
    this.changeDetector.markForCheck();
  }
}
