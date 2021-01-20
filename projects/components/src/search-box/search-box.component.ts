import { TypedSimpleChanges } from '@hypertrace/hyperdash-angular/util/angular-change-object';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div class="ht-search-box" [class.focused]="this.isFocused">
      <ht-icon icon="${IconType.Search}" size="${IconSize.Medium}" class="icon" (click)="onSubmit()"></ht-icon>
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
export class SearchBoxComponent implements OnChanges {
  @Input()
  public placeholder: string = 'Search';

  @Input()
  public value: string = '';

  @Input()
  public debounceTime: number = 0;

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  @Output()
  // tslint:disable-next-line:no-output-native
  public readonly submit: EventEmitter<string> = new EventEmitter();

  public constructor(private readonly subscriptionLifecycle: SubscriptionLifecycle) {}

  public isFocused: boolean = false;
  private readonly debouncedValueSubject: Subject<string> = new Subject();

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.debounceTime) {
      this.subscriptionLifecycle.unsubscribe();
      this.subscriptionLifecycle.add(
        this.debouncedValueSubject
          .pipe(debounceTime(this.debounceTime))
          .subscribe(value => this.valueChange.emit(value))
      );
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
}
