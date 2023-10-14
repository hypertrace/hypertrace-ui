import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
      <span class="label" [ngStyle]="{ color: this.labelColor ? this.labelColor : '' }">{{ this.label }}</span>
    </div></ht-event-blocker
  >`
})
export class MenuItemComponent {
  @Input()
  public label!: string;

  @Input()
  public icon?: string;

  @Input()
  public iconColor?: string;

  @Input()
  public labelColor?: string;

  @Input()
  public disabled?: boolean;

  public getStyleClasses(): string[] {
    return this.disabled ? ['disabled'] : [];
  }
}
