import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable, Subject } from 'rxjs';
import { SelectOption } from './select-option';

@Component({
  selector: 'ht-select-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '' // No template, just gathering data
})
export class SelectOptionComponent<V> implements OnChanges, SelectOption<V> {
  @Input()
  public value!: V;

  @Input()
  public label!: string;

  @Input()
  public selectedLabel?: string;

  @Input()
  public style: SelectOptionStyle = SelectOptionStyle.Default;

  @Input()
  public icon?: IconType;

  @Input()
  public iconColor?: string;

  @Input()
  public iconBorder?: string;

  @Input()
  public iconBorderRadius?: string;

  @Input()
  public disabled?: boolean;

  private readonly optionChangeSubject$: Subject<V> = new Subject<V>();
  public readonly optionChange$: Observable<V> = this.optionChangeSubject$.asObservable();

  public ngOnChanges(): void {
    this.optionChangeSubject$.next(this.value);
  }
}

export const enum SelectOptionStyle {
  Default = 'default',
  Primary = 'primary'
}
