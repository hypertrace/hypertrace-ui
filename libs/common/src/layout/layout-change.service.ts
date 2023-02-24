import { ElementRef, Injectable, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, share } from 'rxjs/operators';

@Injectable()
export class LayoutChangeService implements OnDestroy {
  protected readonly layoutChangeSubject: Subject<LayoutChangeEvent> = new Subject();
  private readonly previouslyCheckedEvents: WeakSet<LayoutChangeEvent> = new WeakSet();
  private readonly boundingElement: Element;
  private lastMeasuredHeight?: number;
  private lastMeasuredWidth?: number;

  public layout$: Observable<void> = this.layoutChangeSubject.pipe(
    map(_ => undefined),
    share()
  );

  public constructor(
    hostElementRef: ElementRef,
    @SkipSelf() @Optional() private readonly parentLayoutChange?: LayoutChangeService
  ) {
    this.boundingElement = hostElementRef.nativeElement;

    // Filter out layout changes from our parent if we didn't change size
    (this.parentLayoutChange?.getLayoutChangeEventObservable() ?? this.getWindowResizeEvents())
      .pipe(filter(event => this.hasLayoutChanged(event)))
      .subscribe(this.layoutChangeSubject);
  }

  public getLayoutChangeEventObservable(): Observable<LayoutChangeEvent> {
    return this.layoutChangeSubject;
  }

  public publishLayoutChange(): void {
    this.broadcastOrEmitLayoutChange({});
  }

  public ngOnDestroy(): void {
    this.layoutChangeSubject.complete();
  }

  public initialize(): void {
    if (this.lastMeasuredHeight === undefined) {
      this.assignMeasurements(this.boundingElement.getBoundingClientRect());
    }
  }

  protected broadcastOrEmitLayoutChange(event: LayoutChangeEvent): void {
    if (!this.parentLayoutChange || !this.hasLayoutChanged(event)) {
      // I am (g)root, or I haven't changed size. We can stop here and broadcast
      this.broadcastLayoutChange(event);
    } else {
      // I have a parent, and I (may have) changed - delegate to the parent
      this.parentLayoutChange.broadcastOrEmitLayoutChange(event);
    }
  }

  private broadcastLayoutChange(layoutEvent: LayoutChangeEvent): void {
    this.layoutChangeSubject.next(layoutEvent);
  }

  private hasLayoutChanged(event: LayoutChangeEvent): boolean {
    // Because checking change is impure (it determines if we've changed since last check), we only ever run it once per event.
    // Any later calls must be true or propagation would have ended.
    if (!this.previouslyCheckedEvents.has(event)) {
      this.previouslyCheckedEvents.add(event);

      return this.checkForChange();
    }

    return true;
  }

  private getWindowResizeEvents(): Observable<LayoutChangeEvent> {
    return fromEvent(window, 'resize').pipe(
      debounceTime(80),
      map(() => ({}))
    );
  }

  private checkForChange(): boolean {
    const rect = this.boundingElement.getBoundingClientRect();
    const change = this.hasMeasurementChanged(rect);
    this.assignMeasurements(rect);

    return change;
  }

  private hasMeasurementChanged(rect: ClientRect): boolean {
    const heightChange = this.lastMeasuredHeight === undefined || this.lastMeasuredHeight !== rect.height;
    const widthChange = this.lastMeasuredWidth === undefined || this.lastMeasuredWidth !== rect.width;

    return heightChange || widthChange;
  }

  private assignMeasurements(rect: ClientRect): void {
    this.lastMeasuredHeight = rect.height;
    this.lastMeasuredWidth = rect.width;
  }
}

// tslint:disable-next-line: no-empty-interface empty object so we can have a unique ref
interface LayoutChangeEvent {}
