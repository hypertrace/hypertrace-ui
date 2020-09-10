import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Colors } from '@hypertrace/common';

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
export class LabelTagComponent implements OnInit {
  @Input()
  public label?: string;

  @Input()
  public labelColor?: string;

  @Input()
  public backgroundColor?: string;

  public ngOnInit() {
    this.backgroundColor = this.backgroundColor ?? Colors.Gray1;
    this.labelColor = this.labelColor ?? Colors.Gray9;
  }
}
