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
    <ht-application-header>
      <div class="ht-logo" logo>
        <ht-icon icon="${IconType.Hypertrace}" size="${IconSize.Inherit}"></ht-icon>
      </div>
    </ht-application-header>
    <div class="app-body">
      <ht-navigation class="left-nav"></ht-navigation>
      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class ApplicationFrameComponent {}
