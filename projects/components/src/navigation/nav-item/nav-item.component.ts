import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeatureState } from '@hypertrace/common';
import { IconSize } from '../../icon/icon-size';
import { NavItemLinkConfig } from '../navigation-list.component';

@Component({
  selector: 'htc-nav-item',
  styleUrls: ['./nav-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *htcIfFeature="this.config.features | htcFeature as featureState"
      class="nav-item"
      [ngClass]="{ active: this.active }"
    >
      <htc-icon
        class="icon"
        [icon]="this.config.icon"
        size="${IconSize.Medium}"
        [label]="this.config.label"
        [showTooltip]="this.collapsed"
      >
      </htc-icon>

      <div class="label-container" *ngIf="!this.collapsed">
        <span class="label">{{ this.config.label }}</span>
        <span *ngIf="featureState === '${FeatureState.Preview}'" class="soon-container">
          <span class="soon">SOON</span>
        </span>
      </div>
    </div>
  `
})
export class NavItemComponent {
  @Input()
  public config!: NavItemLinkConfig;

  @Input()
  public active: boolean = true;

  @Input()
  public collapsed: boolean = true;
}
