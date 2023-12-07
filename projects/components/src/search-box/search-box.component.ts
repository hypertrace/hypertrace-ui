import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ApplicationFeature,
  Color,
  FeatureState,
  FeatureStateResolver,
  SubscriptionLifecycle,
  TypedSimpleChanges,
} from '@hypertrace/common';
import { combineLatest, Observable, Subject, timer } from 'rxjs';
import { debounce, debounceTime, map } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { PopoverService } from '../popover/popover.service';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from '../popover/popover';
import { isEmpty, uniq } from 'lodash-es';

@Component({
  selector: 'ht-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div
      class="ht-search-box"
      [ngClass]="this.displayMode"
      [class.focused]="this.isFocused"
      [class.collapsable]="this.collapsable"
      [class.has-value]="!(this.value | htIsEmpty)"
    >
      <ht-icon
        icon="${IconType.Search}"
        size="${IconSize.Small}"
        class="icon search"
        (click)="this.onSearchIconClick()"
      ></ht-icon>
      <input
        #input
        class="input"
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (input)="this.onValueChange()"
        (keyup.enter)="this.onSubmit()"
        (focus)="this.onInputFocus()"
        (blur)="this.onInputBlur()"
      />
      <ht-icon
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        class="icon close"
        *ngIf="value"
        (click)="this.clearValue()"
      ></ht-icon>

      <ng-template #searchHistoryTemplate>
        <div class="search-history">
          <header class="search-history-header">
            <ht-icon
              class="icon"
              icon="${IconType.TimeHistory}"
              color="${Color.Gray7}"
              size="${IconSize.Small}"
            ></ht-icon>
            <div class="title">Search History</div>
          </header>
          <section class="search-history-section">
            <ht-event-blocker event="click">
              <div
                *ngFor="let searchText of this.filteredSearchHistory"
                class="item"
                (click)="this.onSearchedHistoryValueClick(searchText)"
              >
                <div class="text">{{ searchText }}</div>
                <ht-icon icon="${IconType.Search}" color="${Color.Blue4}" size="${IconSize.Small}"></ht-icon>
              </div>
            </ht-event-blocker>
          </section>
        </div>
      </ng-template>
    </div>
  `,
})
export class SearchBoxComponent implements OnInit, OnChanges {
  @Input()
  public placeholder: string = 'Search';

  @Input()
  public value: string = '';

  @Input()
  public debounceTime?: number;

  @Input()
  public displayMode: SearchBoxDisplayMode = SearchBoxDisplayMode.Border;

  @Input()
  public searchMode: SearchBoxEmitMode = SearchBoxEmitMode.Incremental;

  @Input()
  public enableSearchHistory: boolean = true; // Experimental

  @Input()
  public collapsable: boolean = false;

  @Input()
  public searchHistoryDebounceTime: number | undefined;

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly submit: EventEmitter<string> = new EventEmitter();

  @ViewChild('searchHistoryTemplate')
  private readonly searchHistoryTemplate!: TemplateRef<unknown>;

  @ViewChild('input')
  private readonly inputElement!: ElementRef<HTMLInputElement>;

  public readonly enableSearchOnTrigger$: Observable<boolean>;

  private lastEmittedValues: string[] = [];
  public searchHistory: string[] = [];
  public filteredSearchHistory: string[] = [];

  public popover?: PopoverRef;

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly host: ElementRef,
    private readonly popoverService: PopoverService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly featureStateResolver: FeatureStateResolver,
  ) {
    this.enableSearchOnTrigger$ = this.featureStateResolver
      .getFeatureState(ApplicationFeature.TriggerBasedSearch)
      .pipe(map(state => state === FeatureState.Enabled));
  }

  public isFocused: boolean = false;
  private readonly debouncedValueSubject: Subject<string> = new Subject();

  public ngOnInit(): void {
    this.setDebouncedSubscription();

    if (this.enableSearchHistory) {
      this.setSearchHistorySubscriptions();
    }
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.debounceTime || changes.searchMode) {
      this.setDebouncedSubscription();
    }
  }

  public onSearchIconClick(): void {
    if (this.isFocused) {
      this.onSubmit();
    } else {
      this.inputElement.nativeElement.focus();
      this.isFocused = true;
    }
  }

  public onSubmit(): void {
    this.submit.emit(this.value);
  }

  public onValueChange(): void {
    this.value = this.value.trim();
    this.debouncedValueSubject.next(this.value);
  }

  public clearValue(): void {
    this.inputElement.nativeElement.focus();
    if (this.value.length === 0) {
      return;
    }

    this.value = '';
    this.onValueChange();
  }

  public onInputFocus(): void {
    if (this.enableSearchHistory && this.filteredSearchHistory.length > 0) {
      this.showPopover();
    }

    this.isFocused = true;
  }

  public onInputBlur(): void {
    if (this.enableSearchHistory) {
      this.handleSearchHistoryOnInputBlur();
    }

    this.isFocused = false;
  }

  public onSearchedHistoryValueClick(value: string): void {
    this.inputElement.nativeElement.focus();
    this.value = value.trim();
    this.debouncedValueSubject.next(this.value);
    this.cdr.detectChanges();
    this.closePopover();
  }

  private setDebouncedSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();
    this.subscriptionLifecycle.add(
      combineLatest([this.debouncedValueSubject, this.getDebounceTime()])
        .pipe(debounce(([_, valueDebounceTime]) => timer(valueDebounceTime)))
        .subscribe(([value, _]) => this.valueChange.emit(value)),
    );
  }

  private getDebounceTime(): Observable<number> {
    return this.enableSearchOnTrigger$.pipe(
      map(searchOnTriggerEnabled => {
        const defaultDebounceTime = this.debounceTime ?? 0;
        // If incremental search mode is enabled, then use the inputs to compute debounce
        if (this.searchMode === SearchBoxEmitMode.Incremental) {
          return defaultDebounceTime;
        }

        // If on-submit search mode is enabled via the FF and the input, then use the overridden debounce time.
        // Doing 'and' here to ensure the default behaviour continues until overridden by an FF.
        return searchOnTriggerEnabled && this.searchMode === SearchBoxEmitMode.OnSubmit ? 5000 : defaultDebounceTime;
      }),
    );
  }

  private setSearchHistorySubscriptions(): void {
    this.subscriptionLifecycle.add(
      this.debouncedValueSubject.asObservable().subscribe(value => {
        this.filteredSearchHistory = this.searchHistory.filter(text =>
          text.toLowerCase().includes(value.toLowerCase()),
        );

        if (this.filteredSearchHistory.length === 0 && this.popover !== undefined) {
          this.closePopover();
        } else if (this.filteredSearchHistory.length > 0 && this.popover === undefined) {
          this.showPopover();
        }

        this.cdr.detectChanges();
      }),
    );

    this.subscriptionLifecycle.add(
      this.valueChange
        .asObservable()
        .pipe(debounceTime(this.searchHistoryDebounceTime ?? 400))
        .subscribe(emittedValue => {
          if (!isEmpty(emittedValue)) {
            this.lastEmittedValues = [emittedValue, ...this.lastEmittedValues];
          }
        }),
    );
  }

  private showPopover(): void {
    this.closePopover();

    this.popover = this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: this.host,
        locationPreferences: [
          PopoverRelativePositionLocation.BelowLeftAligned,
          PopoverRelativePositionLocation.BelowRightAligned,
          PopoverRelativePositionLocation.AboveLeftAligned,
          PopoverRelativePositionLocation.AboveRightAligned,
        ],
      },
      componentOrTemplate: this.searchHistoryTemplate,
      backdrop: PopoverBackdrop.Transparent,
    });
    this.popover.closeOnBackdropClick();
    this.popover.closeOnPopoverContentClick();
  }

  private closePopover(): void {
    this.popover?.close();
    this.popover = undefined;
  }

  private handleSearchHistoryOnInputBlur(): void {
    this.searchHistory = uniq([...this.lastEmittedValues, ...this.searchHistory]);
    this.filteredSearchHistory = [...this.searchHistory];
    this.lastEmittedValues = [];
  }
}

export const enum SearchBoxDisplayMode {
  Border = 'border',
  NoBorder = 'no-border',
}

export const enum SearchBoxEmitMode {
  // Use incremental search mode for client side filtering and light load server side filtering.
  Incremental = 'incremental',
  // Use on-submit search mode for heavy load server side filtering.
  OnSubmit = 'on-submit',
}
