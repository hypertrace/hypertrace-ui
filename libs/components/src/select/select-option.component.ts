import { ChangeDetectionStrategy, Component, ContentChild, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable, Subject } from 'rxjs';
import { IconBorder } from '../icon/icon-border';
import { SelectOptionRendererDirective } from './directive/select-option-renderer.directive';
import { SelectOption } from './select-option';

@Component({
  selector: 'ht-select-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``
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
  public iconBorderType?: IconBorder;

  @Input()
  public iconBorderColor?: string;

  @Input()
  public iconBorderRadius?: string;

  @Input()
  public disabled?: boolean;

  @ContentChild(SelectOptionRendererDirective)
  public selectOptionRenderer?: SelectOptionRendererDirective;

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
