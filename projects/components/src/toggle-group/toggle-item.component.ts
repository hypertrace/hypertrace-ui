import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-toggle-item',
  styleUrls: ['./toggle-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-item">
      <ht-icon *ngIf="this.icon; else labelBlock" class="icon" [icon]="this.icon" size="${IconSize.Medium}"></ht-icon>
      <ng-template #labelBlock>
        <ht-label class="label" [label]="this.label"></ht-label>
        <ht-label-tag
          *ngIf="this.tagValue !== ''"
          class="tag"
          [label]="this.tagValue"
          [backgroundColor]="this.tagBackgroundColor"
          [labelColor]="this.tagColor"
        ></ht-label-tag>
      </ng-template>
    </div>
  `
})
export class ToggleItemComponent {
  @Input()
  public label?: string;

  @Input()
  public icon?: IconType;

  @Input()
  public tagValue?: string;

  @Input()
  public tagColor?: Color = Color.Gray9;

  @Input()
  public tagBackgroundColor?: Color = Color.Gray2;

  public constructor(public readonly elementRef: ElementRef) {}
}
