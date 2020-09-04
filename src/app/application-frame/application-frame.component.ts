import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { LayoutChangeService } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

@Component({
  selector: 'ht-application-frame',
  styleUrls: ['./application-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LayoutChangeService], // Provided as root layout
  template: `
    <htc-application-header>
      <div class="ht-logo" logo>
        <htc-icon icon="${IconType.Hypertrace}" size="${IconSize.Inherit}"></htc-icon>
      </div>
    </htc-application-header>
    <div class="app-body">
      <ht-navigation class="left-nav"></ht-navigation>
      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class ApplicationFrameComponent {}
