import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TimeRangeService
} from '@hypertrace/common';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonSize, ButtonStyle } from '../button/button';

@Component({
  selector: 'ht-open-in-new-tab',
  styleUrls: ['./open-in-new-tab.component.scss'],
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
  public size?: ButtonSize = ButtonSize.Medium;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public openInNewTab(): void {
    merge(this.navigationService.navigation$, this.timeRangeService.getTimeRangeAndChanges())
      .pipe(map(() => this.timeRangeService.getShareableCurrentUrl()))
      .subscribe(url =>
        this.navigationService.navigate({
          navType: NavigationParamsType.External,
          windowHandling: ExternalNavigationWindowHandling.NewWindow,
          url: url
        })
      );
  }
}
