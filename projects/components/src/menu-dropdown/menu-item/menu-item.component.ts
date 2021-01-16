import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'ht-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./menu-item.component.scss'],
  template: `<ht-event-blocker event="click" class="menu-item-container" [enabled]="this.disabled"
    ><div class="menu-item" [ngClass]="this.getStyleClasses()">
      <ht-icon
        class="icon"
        *ngIf="this.icon"
        [icon]="this.icon"
        size="${IconSize.Small}"
        [color]="this.iconColor"
      ></ht-icon>
      <span class="label">{{ this.label }}</span>
    </div></ht-event-blocker
  >`
})
export class MenuItemComponent {
  @Input()
  public label!: string;

  @Input()
  public icon?: IconType;

  @Input()
  public iconColor?: string;

  @Input()
  public disabled?: boolean;

  public getStyleClasses(): string[] {
    return this.disabled ? ['disabled'] : [];
  }
}
