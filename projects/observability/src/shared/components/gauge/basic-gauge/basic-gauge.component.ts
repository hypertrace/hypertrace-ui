import { Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-basic-gauge',
  template: `
    <g
      class="input-data"
      htTooltip="{{ this.value }} of {{ this.maxValue }}"
    >
      <path
        class="value-ring"
        *ngIf="this.hasRadius"
        [attr.d]="this.valueArc"
        [attr.fill]="this.defaultColor"
      ></path>
      <text x="0" y="-4" class="value-display" [attr.fill]="this.defaultColor">
        {{ this.value }}
      </text>
      <text x="0" y="20" class="label-display">{{ this.defaultLabel }}</text>
    </g>
  `,
  styleUrls: ['./basic-gauge.component.scss']
})
export class BasicGaugeComponent {

  @Input()
  public value: number = 0;

  @Input()
  public maxValue: number = 10;

  @Input()
  public defaultLabel: string = '';

  @Input()
  public defaultColor: Color | string = '';

  @Input()
  public hasRadius: boolean = false;

  @Input()
  public valueArc?: string | undefined = '';
}
