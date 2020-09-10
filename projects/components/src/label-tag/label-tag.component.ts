import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-label-tag',
  styleUrls: ['./label-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="label-tag" [ngStyle]="{ backgroundColor: this.backgroundColor, color: this.labelColor }">
      {{ this.label }}
    </div>
  `
})
export class LabelTagComponent {
  @Input()
  public label?: string;

  @Input()
  public labelColor?: Color;

  @Input()
  public backgroundColor?: Color;
}
