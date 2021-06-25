import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { SubscriptionLifecycle2 } from './subscription-lifeycle2.service';

@Component({
  selector: 'ht-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, SubscriptionLifecycle2],
  template: `
    <div class="ht-search-box" [ngClass]="this.displayMode" [class.focused]="this.isFocused">
      <ht-icon icon="${IconType.Search}" size="${IconSize.Small}" class="icon" (click)="onSubmit()"></ht-icon>
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

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  @Output()
  // tslint:disable-next-line:no-output-native
  public readonly submit: EventEmitter<string> = new EventEmitter();

  public constructor(public readonly subscriptionLifecycle: SubscriptionLifecycle, public readonly s2: SubscriptionLifecycle2) {

  }

  public isFocused: boolean = false;
  private readonly debouncedValueSubject: Subject<string> = new Subject();

  public ngOnInit(): void {
    this.setDebouncedSubscription();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.debounceTime) {
      this.setDebouncedSubscription();
    }
  }

  public onSubmit(): void {
    this.submit.emit(this.value);
  }

  public onValueChange(): void {
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
    this.s2.unsubscribe();
    this.s2.add(
      this.debouncedValueSubject
        .pipe(debounceTime(this.debounceTime ?? 0))
        .subscribe(value => this.valueChange.emit(value))
    );
  }
}

export const enum SearchBoxDisplayMode {
  Border = 'border',
  NoBorder = 'no-border'
}
