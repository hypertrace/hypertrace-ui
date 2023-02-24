import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IconSize } from '../../icon/icon-size';
import { Filter } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterUrlService } from '../filter/filter-url.service';
import { FilterBarService } from './filter-bar.service';
import { FilterChipComponent } from './filter-chip/filter-chip.component';

@Component({
  selector: 'ht-filter-bar',
  styleUrls: ['./filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="filter-bar"
      (focusin)="this.isFocused = true"
      (focusout)="this.isFocused = false"
      [class.focused]="this.isFocused"
    >
      <div class="content">
        <!-- Search Icon -->
        <ht-icon icon="${IconType.Filter}" size="${IconSize.Medium}" class="search-icon"></ht-icon>

        <!-- Filters -->
        <div class="filters">
          <ht-filter-chip
            *ngFor="let filter of this.internalFilters$ | async; let index = index"
            class="filter"
            [filter]="filter"
            [attributes]="this.attributes"
            (apply)="this.onApply(filter, $event)"
            (clear)="this.onClear(filter)"
          ></ht-filter-chip>
          <ht-filter-chip
            #filterInput
            class="filter filter-input"
            [clearOnEnter]="true"
            [attributes]="this.attributes"
            (apply)="this.onInputApply($event)"
          ></ht-filter-chip>
        </div>

        <!-- Clear Button -->
        <ht-icon
          *ngIf="this.internalFilters$ | async"
          class="clear-icon"
          icon="${IconType.CloseCircleFilled}"
          size="${IconSize.Small}"
          tabindex="0"
          (keydown.enter)="this.onClearAll()"
          (click)="this.onClearAll()"
        ></ht-icon>
      </div>
    </div>
    <div [innerHTML]="this.instructions" class="instructions"></div>
  `
})
export class FilterBarComponent implements OnChanges, OnInit, OnDestroy {
  @Input()
  public attributes?: FilterAttribute[]; // Required

  @Input()
  public filters?: Filter[] = [];

  @Input()
  public syncWithUrl: boolean = false;

  @Output()
  public readonly filtersChange: EventEmitter<Filter[]> = new EventEmitter();

  @ViewChild('filterInput')
  public readonly filterInput?: FilterChipComponent;

  public isFocused: boolean = false;

  private readonly attributeSubject$: BehaviorSubject<FilterAttribute[]> = new BehaviorSubject<FilterAttribute[]>([]);
  private readonly internalFiltersSubject$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
  public readonly internalFilters$: Observable<Filter[]> = this.internalFiltersSubject$
    .asObservable()
    .pipe(distinctUntilChanged(isEqual));

  private subscription?: Subscription;

  public readonly instructions: string =
    'Select <b>one or more</b> parameters to filter by. The value is ' +
    '<b>case sensitive</b>. Examples: <b>Duration >= 10</b> or <b>Service Name = dataservice</b>';

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly filterUrlService: FilterUrlService,
    private readonly filterBarService: FilterBarService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.attributes) {
      this.attributeSubject$.next(this.attributes || []);
      this.syncWithUrl ? this.readFromUrlFilters() : this.onFiltersChanged(this.filters || [], false);
    }
  }

  public ngOnInit(): void {
    if (this.syncWithUrl) {
      this.subscribeToUrlFilterChanges();
    }
  }

  public ngOnDestroy(): void {
    this.subscription && this.subscription.unsubscribe();
  }

  private subscribeToUrlFilterChanges(): void {
    this.subscription = this.attributeSubject$
      .pipe(switchMap(attributes => this.filterUrlService.getUrlFiltersChanges$(attributes)))
      .subscribe(filters => this.onFiltersChanged(filters, true, false));
  }

  private onFiltersChanged(filters: Filter[], emit: boolean = true, writeIfSyncEnabled: boolean = true): void {
    this.internalFiltersSubject$.next([...filters]);
    this.changeDetector.markForCheck();

    if (writeIfSyncEnabled && this.syncWithUrl && !!this.attributes) {
      this.writeToUrlFilter();
    }

    emit && this.filtersChange.emit(this.internalFiltersSubject$.value);
  }

  private readFromUrlFilters(): void {
    const filters = this.filterUrlService.getUrlFilters(this.attributes || []);
    this.onFiltersChanged(filters, true, false);
  }

  private writeToUrlFilter(): void {
    this.filterUrlService.setUrlFilters(this.internalFiltersSubject$.value);
  }

  public onInputApply(filter: Filter): void {
    this.onFiltersChanged(this.filterBarService.addFilter(this.internalFiltersSubject$.value, filter));
    this.resetFocus();
  }

  public onApply(originalFilter: Filter, newFilter: Filter): void {
    this.updateFilter(originalFilter, newFilter);
    this.resetFocus();
  }

  public onClear(filter: Filter): void {
    this.deleteFilter(filter);
    this.resetFocus();
  }

  public onClearAll(): void {
    this.onFiltersChanged([]);
    this.resetFocus(); // TODO: This isn't working. Button remains activeElement. Need to revisit.
  }

  private resetFocus(): void {
    this.filterInput?.focus();
  }

  private updateFilter(oldFilter: Filter, newFilter: Filter): void {
    this.onFiltersChanged(this.filterBarService.updateFilter(this.internalFiltersSubject$.value, oldFilter, newFilter));
  }

  private deleteFilter(filter: Filter): void {
    this.onFiltersChanged(this.filterBarService.deleteFilter(this.internalFiltersSubject$.value, filter));
  }
}
