import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ApplicationFeature,
  FeatureState,
  FeatureStateResolver,
  SubscriptionLifecycle,
  TypedSimpleChanges
} from '@hypertrace/common';
import { combineLatest, Observable, Subject, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div class="ht-search-box" [ngClass]="this.displayMode" [class.focused]="this.isFocused">
      <ht-icon icon="${IconType.Search}" size="${IconSize.Small}" class="icon" (click)="this.onSubmit()"></ht-icon>
      <input
        class="input"
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (input)="this.onValueChange()"
        (keyup.enter)="this.onSubmit()"
        (focus)="this.isFocused = true"
        (blur)="this.isFocused = false"
      />
      <ht-icon
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        class="icon close"
        *ngIf="value"
        (click)="this.clearValue()"
      ></ht-icon>
    </div>
  `
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

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  @Output()
  // tslint:disable-next-line:no-output-native
  public readonly submit: EventEmitter<string> = new EventEmitter();

  public readonly enableSearchOnTrigger$: Observable<boolean>;
  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly featureStateResolver: FeatureStateResolver
  ) {
    this.enableSearchOnTrigger$ = this.featureStateResolver
      .getFeatureState(ApplicationFeature.EnableTriggerBasedSearch)
      .pipe(map(state => state === FeatureState.Enabled));
  }

  public isFocused: boolean = false;
  private readonly debouncedValueSubject: Subject<string> = new Subject();

  public ngOnInit(): void {
    this.setDebouncedSubscription();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.debounceTime || changes.searchMode) {
      this.setDebouncedSubscription();
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
    if (this.value.length === 0) {
      return;
    }

    this.value = '';
    this.onValueChange();
  }

  private setDebouncedSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();
    this.subscriptionLifecycle.add(
      combineLatest([this.debouncedValueSubject, this.getDebounceTime()])
        .pipe(debounce(([_, debounceTime]) => timer(debounceTime)))
        .subscribe(([value, _]) => this.valueChange.emit(value))
    );
  }

  private getDebounceTime(): Observable<number> {
    return this.enableSearchOnTrigger$.pipe(
      map(enabled => {
        const defaultDebounceTime = this.debounceTime ?? 0;
        // If incremental search mode is enabled, then use the inputs to compute debounce
        if (this.searchMode === SearchBoxEmitMode.Incremental) {
          return defaultDebounceTime;
        }

        // If on-submit search mode is enabled via the FF or the input, then use the overridden debounce time
        return enabled || this.searchMode === SearchBoxEmitMode.OnSubmit ? 5000 : defaultDebounceTime;
      })
    );
  }
}

export const enum SearchBoxDisplayMode {
  Border = 'border',
  NoBorder = 'no-border'
}

export const enum SearchBoxEmitMode {
  // Use incremental search mode for client side filtering and light load server side filtering.
  Incremental = 'incremental',
  // Use on-submit search mode for heavy load server side filtering.
  OnSubmit = 'on-submit'
}
