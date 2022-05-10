import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

import { UAParser } from 'ua-parser-js';

@Component({
  selector: 'ht-user-agent-icon',
  styleUrls: ['./user-agent-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-user-agent-icon">
      <ht-icon [htTooltip]="this.userAgent" [icon]="this.browser" [size]="this.iconSize"></ht-icon>
    </div>
  `
})
export class UserAgentIconComponent implements OnChanges {
  @Input()
  public userAgent?: string;

  @Input()
  public iconSize: IconSize = IconSize.ExtraSmall;

  public browser: string = IconType.Unknown;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.userAgent) {
      const parser = new UAParser(this.userAgent);
      this.browser = this.lookupIcon(parser.getBrowser().name);
    }
  }

  private lookupIcon(browser?: string): IconType {
    /*
     * Some of these matches are likely not right. Need to update when user-agent conversation resolves.
     */
    switch (browser?.toLowerCase()) {
      case 'chrome':
        return IconType.BrowserChrome;
      case 'firefox':
        return IconType.BrowserFirefox;
      case 'edge':
        return IconType.BrowserEdge;
      case 'ie':
        return IconType.BrowserInternetExplorer;
      case 'safari':
        return IconType.BrowserChrome;
      default:
        return IconType.Unknown;
    }
  }
}
