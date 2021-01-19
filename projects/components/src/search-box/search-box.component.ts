import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class SearchBoxComponent implements OnInit {
  private static SEARCH_TIME_DELAY_MS: number = 200;

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

  public isFocused: boolean = false;
  public readonly debouncedValueSubject: Subject<string> = new Subject();

  public ngOnInit(): void {
    this.debouncedValueSubject
      .pipe(debounceTime(this.debounceTime))
      .subscribe(value => this.valueChange.emit(value));
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
