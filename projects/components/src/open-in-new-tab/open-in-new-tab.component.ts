import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ExternalNavigationParamsNew } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-open-in-new-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.paramsOrUrl" class="open-in-new-tab" htTooltip="Open in a new tab">
      <ht-link [paramsOrUrl]="this.paramsOrUrl">
        <ht-icon icon="${IconType.OpenInNewTab}" [size]="this.iconSize"></ht-icon>
      </ht-link>
    </div>
  `
})
export class OpenInNewTabComponent {
  @Input()
  public paramsOrUrl?: ExternalNavigationParamsNew | string;

  @Input()
  public iconSize: IconSize = IconSize.Medium;
}
