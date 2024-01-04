import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconRegistryService, IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { isEmpty, isNil } from 'lodash-es';
import { IconBorder } from './icon-border';
import { IconSize } from './icon-size';

@Component({
  selector: 'ht-icon',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-icon
      *ngIf="this.svgIcon; else matIconTemplate"
      class="ht-icon svg-icon"
      [ngClass]="this.styleClasses"
      [ngStyle]="this.customStyles"
      [attr.aria-label]="this.labelToUse"
      [htTooltip]="this.tooltip"
      [svgIcon]="this.svgIcon"
    ></mat-icon>

    <ng-template #matIconTemplate>
      <mat-icon
        class="ht-icon ligature-icon"
        [ngClass]="this.styleClasses"
        [ngStyle]="this.customStyles"
        [attr.aria-label]="this.labelToUse"
        [htTooltip]="this.tooltip"
        [fontSet]="this.fontSet"
        >{{ this.ligatureText }}</mat-icon
      >
    </ng-template>
  `,
})
export class IconComponent implements OnChanges {
  @Input()
  public icon?: string = IconType.None;

  @Input()
  public size: IconSize = IconSize.Medium;

  @Input()
  public borderType: IconBorder = IconBorder.NoBorder;

  @Input()
  public borderColor?: string;

  @Input()
  public borderRadius?: string;

  @Input()
  public label?: string;

  @Input()
  public showTooltip: boolean = false;

  @Input()
  public color?: string;

  public labelToUse: string = '';
  public fontSet: string = '';
  public ligatureText: string = '';
  public svgIcon: string = '';

  public constructor(private readonly iconRegistryService: IconRegistryService) {}

  public ngOnChanges(): void {
    if (this.icon === undefined) {
      this.labelToUse = '';
      this.svgIcon = '';
      this.ligatureText = '';
    } else {
      const iconRenderInfo = this.iconRegistryService.getIconRenderInfo(this.icon, this.label);
      this.labelToUse = iconRenderInfo.label;
      switch (iconRenderInfo.iconRenderType) {
        case 'ligature':
          this.ligatureText = iconRenderInfo.ligatureText;
          this.fontSet = iconRenderInfo.fontSet;
          this.svgIcon = '';
          break;
        case 'svg':
          this.ligatureText = '';
          this.fontSet = '';
          this.svgIcon = iconRenderInfo.svgIcon;
          break;
        default:
          assertUnreachable(iconRenderInfo);
      }
    }
  }

  public get isSvgIcon(): boolean {
    return !isEmpty(this.svgIcon);
  }

  public get styleClasses(): string[] {
    return [this.size, !isNil(this.borderType) ? this.borderType : ''];
  }

  public get customStyles(): Record<string, string> {
    return {
      color: this.color ?? '',
      borderColor: this.borderType !== IconBorder.InsetBorder ? this.borderColor ?? '' : '',
      background: this.borderType === IconBorder.InsetBorder ? this.borderColor ?? '' : '',
      borderRadius: this.borderRadius ?? '',
    };
  }

  public get tooltip(): string | undefined {
    return this.showTooltip ? this.labelToUse : undefined;
  }
}
