import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { ButtonSize, ButtonStyle, ButtonType, ButtonVariant } from './button';

@Component({
  selector: 'ht-button',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-event-blocker event="click" class="button-container" [enabled]="this.disabled">
      <button
        class="button"
        [ngClass]="this.getStyleClasses()"
        [htTrack]
        [htTrackLabel]="this.label"
        [type]="this.type"
      >
        <ht-icon
          *ngIf="this.icon"
          [icon]="this.icon"
          [label]="this.label"
          [size]="this.getIconSizeClass()"
          class="icon leading"
        ></ht-icon>

        <div class="conditional-padding leading" *ngIf="this.label && this.icon"></div>

        <ht-label *ngIf="this.label" [label]="label" class="label"></ht-label>

        <div class="conditional-padding trailing" *ngIf="this.label && this.trailingIcon"></div>
        <ht-icon
          *ngIf="this.trailingIcon"
          [icon]="this.trailingIcon"
          [label]="this.label"
          [size]="this.getIconSizeClass()"
          class="icon trailing"
        ></ht-icon>
      </button>
    </ht-event-blocker>
  `
})
export class ButtonComponent {
  @Input()
  public label?: string;

  /*
  This will by default be a leading icon
  */
  @Input()
  public icon?: IconType;

  @Input()
  public trailingIcon?: IconType;

  @Input()
  public type: ButtonType = ButtonType.Button;

  @Input()
  public variant: ButtonVariant = ButtonVariant.Secondary;

  @Input()
  public size: ButtonSize = ButtonSize.Small;

  @Input()
  public display: ButtonStyle = ButtonStyle.Solid;

  @Input()
  public disabled: boolean | undefined;

  public getStyleClasses(): string[] {
    const classes: string[] = [this.variant, this.size, this.display];

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
      case ButtonSize.Medium:
        return IconSize.Medium;
      case ButtonSize.ExtraSmall:
        return IconSize.ExtraSmall;
      default:
        return IconSize.Small;
    }
  }
}
