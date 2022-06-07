import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-info-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="this.info"
      ><ht-icon icon="${IconType.Info}" [size]="this.iconSize" [htTooltip]="infoTooltipTemplate"></ht-icon>
      <ng-template #infoTooltipTemplate>
        <ng-container *ngTemplateOutlet="this.isInfoAString ? defaultInfoTooltipTemplate : this.info"></ng-container>
      </ng-template>
      <ng-template #defaultInfoTooltipTemplate> {{ this.info }}</ng-template></ng-container
    >
  `
})
export class InfoIconComponent {
  @Input()
  public info?: string | TemplateRef<unknown>;

  @Input()
  public iconSize: IconSize = IconSize.Small;

  public get isInfoAString(): boolean {
    return typeof this.info === 'string';
  }
}
