import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'htc-search-box',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="htc-search-box" [class.focused]="this.isFocused">
      <htc-icon icon="${IconType.Search}" size="${IconSize.Medium}" class="icon" (click)="onSubmit()"></htc-icon>
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
      <htc-icon
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        class="icon close"
        *ngIf="value"
        (click)="this.clearValue()"
      ></htc-icon>
    </div>
  `
})
export class SearchBoxComponent {
  @Input()
  public placeholder: string = 'Search';

  @Input()
  public value: string = '';

  @Output()
  public readonly valueChange: EventEmitter<string> = new EventEmitter();

  @Output()
  // tslint:disable-next-line:no-output-native
  public readonly submit: EventEmitter<string> = new EventEmitter();

  public isFocused: boolean = false;

  public onSubmit(): void {
    this.submit.emit(this.value);
  }

  public onValueChange(): void {
    this.valueChange.emit(this.value);
  }

  public clearValue(): void {
    if (this.value.length === 0) {
      return;
    }

    this.value = '';
    this.onValueChange();
  }
}
