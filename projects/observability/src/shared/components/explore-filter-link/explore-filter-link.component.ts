import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationParams } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

@Component({
  selector: 'ht-explore-filter-link',
  styleUrls: ['./explore-filter-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-link class="explore-filter" [paramsOrUrl]="this.paramsOrUrl">
      <ng-content></ng-content>
      <ht-icon class="filter-icon" size="${IconSize.ExtraSmall}" icon="${IconType.Filter}"></ht-icon>
    </ht-link>
  `
})
export class ExploreFilterLinkComponent {
  @Input()
  public paramsOrUrl?: NavigationParams | string;
}
