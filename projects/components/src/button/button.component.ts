import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { ButtonRole, ButtonSize, ButtonStyle } from './button';

@Component({
  selector: 'htc-button',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-event-blocker event="click" class="button-container" [enabled]="this.disabled">
      <button class="button" [ngClass]="this.getStyleClasses()">
        <htc-icon
          *ngIf="this.icon && !this.trailingIcon"
          [icon]="this.icon"
          [label]="this.label"
          [size]="this.getIconSizeClass()"
          class="icon leading"
        ></htc-icon>

        <div class="conditional-padding leading" *ngIf="this.label && this.icon && !this.trailingIcon"></div>

        <htc-label *ngIf="this.label" [label]="label" class="label"></htc-label>

        <div class="conditional-padding trailing" *ngIf="this.label && this.icon && this.trailingIcon"></div>
        <htc-icon
          *ngIf="this.icon && this.trailingIcon"
          [icon]="this.icon"
          [label]="this.label"
          [size]="this.getIconSizeClass()"
          class="icon trailing"
        ></htc-icon>
      </button>
    </htc-event-blocker>
  `
})
export class ButtonComponent {
  @Input()
  public label?: string;

  @Input()
  public icon?: IconType;

  @Input()
  public trailingIcon?: boolean;

  @Input()
  public role: ButtonRole = ButtonRole.Secondary;

  @Input()
  public size: ButtonSize = ButtonSize.Medium;

  @Input()
  public display: ButtonStyle = ButtonStyle.Solid;

  @Input()
  public disabled: boolean | undefined;

  public getStyleClasses(): string[] {
    const classes: string[] = [this.role, this.size, this.display];

    if (this.disabled) {
      classes.push('disabled');
    }

    if (this.icon !== undefined && isNil(this.label)) {
      classes.push('icon-only');
    }

    return classes;
  }

  public getIconSizeClass(): string {
    switch (this.size) {
      case ButtonSize.Large:
        return IconSize.Large;
      default:
        return IconSize.Small;
    }
  }
}
