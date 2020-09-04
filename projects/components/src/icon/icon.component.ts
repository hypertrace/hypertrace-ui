import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconRegistryService, IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { IconSize } from './icon-size';

@Component({
  selector: 'htc-icon',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-icon
      class="htc-icon"
      [ngClass]="this.size"
      [ngStyle]="{ color: this.color ? this.color : '' }"
      [attr.aria-label]="this.labelToUse"
      [htcTooltip]="this.showTooltip ? this.labelToUse : undefined"
      [fontSet]="this.fontSet"
      [svgIcon]="this.svgIcon"
      >{{ this.ligatureText }}</mat-icon
    >
  `
})
export class IconComponent implements OnChanges {
  @Input()
  public icon?: string = IconType.None;

  @Input()
  public size: IconSize = IconSize.Medium;

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
}
