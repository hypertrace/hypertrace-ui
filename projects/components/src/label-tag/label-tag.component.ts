import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-label-tag',
  styleUrls: ['./label-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="label-tag"
      [ngStyle]="{ backgroundColor: this.backgroundColor, color: this.labelColor, borderColor: this.borderColor }"
      [ngClass]="[this.textStyle]"
    >
      <ht-icon
        *ngIf="this.prefixIcon"
        [icon]="this.prefixIcon"
        size="${IconSize.Small}"
        [color]="this.labelColor"
      ></ht-icon>
      {{ this.label }}
    </div>
  `,
})
export class LabelTagComponent {
  @Input()
  public label?: string;

  @Input()
  public labelColor?: Color;

  @Input()
  public backgroundColor?: Color;

  @Input()
  public prefixIcon?: string;

  @Input()
  public borderColor?: string;

  @Input()
  public textStyle: LabelTagTextStyle = LabelTagTextStyle.Uppercase;
}

export const enum LabelTagTextStyle {
  Regular = 'regular',
  Uppercase = 'uppercase',
}
