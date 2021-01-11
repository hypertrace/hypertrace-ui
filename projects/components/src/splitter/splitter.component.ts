import { debounceTime, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { throwError } from 'rxjs';
import { LayoutChangeService, TypedSimpleChanges, SubscriptionLifecycle } from '@hypertrace/common';
import { SplitterDirection } from './splitter';
import { SplitterService } from './splitter.service';

@Component({
  selector: 'ht-splitter',
  styleUrls: ['./splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SplitterService, SubscriptionLifecycle],
  template: `
    <div class="splitter" *ngIf="this.direction" [ngClass]="[this.direction | lowercase]">
      <div class="cursor"></div>
    </div>
  `
})
export class SplitterComponent implements OnChanges {
  @Input()
  public readonly direction?: SplitterDirection;

  @Output()
  public readonly layoutChange: EventEmitter<boolean> = new EventEmitter();

  public constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly splitterService: SplitterService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly layoutChangeService: LayoutChangeService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.direction && this.direction !== undefined) {
      this.setupMouseActionSubscription();
    }
  }

  private setupMouseActionSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();

    this.subscriptionLifecycle.add(
      this.buildSplitterLayoutChangeObservable()
        .pipe(
          debounceTime(20),
          tap(layoutChange => this.layoutChange.emit(layoutChange)),
          tap(layoutChange => layoutChange && this.layoutChangeService.publishLayoutChange())
        )
        .subscribe()
    );
  }

  private buildSplitterLayoutChangeObservable(): Observable<boolean> {
    const hostElement = this.element.nativeElement as HTMLElement;
    const parentOfHostElement = hostElement.parentElement;

    if (!parentOfHostElement) {
      return throwError('Parent container element not present');
    }

    return this.splitterService.buildSplitterLayoutChangeObservable(hostElement, parentOfHostElement, this.direction!);
  }
}
