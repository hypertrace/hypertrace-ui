import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TimeRangeService
} from '@hypertrace/common';
import { ButtonSize, ButtonStyle } from '../button/button';

@Component({
  selector: 'ht-open-in-new-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="open-in-new-tab" htTooltip="Open in a new tab">
      <ht-button
        class="open-in-new-tab-button"
        display="${ButtonStyle.Outlined}"
        [size]="this.size"
        icon="${IconType.OpenInNewTab}"
        (click)="this.openInNewTab()"
      ></ht-button>
    </div>
  `
})
export class OpenInNewTabComponent {
  @Input()
  public size?: ButtonSize = ButtonSize.Small;

  @Input()
  public url?: string;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public openInNewTab(): void {
    this.navigationService.navigate({
      navType: NavigationParamsType.External,
      windowHandling: ExternalNavigationWindowHandling.NewWindow,
      // Use input url if available. Else construct a shareable URL for the page
      url: this.url ?? this.timeRangeService.getShareableCurrentUrl()
    });
  }
}
