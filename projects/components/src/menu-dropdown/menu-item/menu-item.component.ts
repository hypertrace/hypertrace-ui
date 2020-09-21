import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'ht-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./menu-item.component.scss'],
  template: `<div class="menu-item">
    <ht-icon
      class="icon"
      *ngIf="this.icon"
      [icon]="this.icon"
      size="${IconSize.Small}"
      [color]="this.iconColor"
    ></ht-icon>
    <span class="label">{{ this.label }}</span>
  </div>`
})
export class MenuItemComponent {
  @Input()
  public label!: string;

  @Input()
  public icon?: IconType;

  @Input()
  public iconColor?: string;
}
