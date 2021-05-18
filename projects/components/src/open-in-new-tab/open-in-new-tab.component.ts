import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';
import { LinkComponent } from '../link/link.component';

@Component({
  selector: 'ht-open-in-new-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.navigationPath" class="open-in-new-tab" htTooltip="Open in a new tab">
      <ht-link [paramsOrUrl]="this.paramsOrUrl">
        <ht-icon icon="${IconType.OpenInNewTab}" [size]="this.iconSize" ></ht-icon>
      </ht-link>
    </div>
  `
})
export class OpenInNewTabComponent extends LinkComponent {
  @Input()
  public iconSize: IconSize = IconSize.Medium;
}
