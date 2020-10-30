import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TimeRangeService
} from '@hypertrace/common';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonSize, ButtonStyle } from '../button/button';

@Component({
  selector: 'ht-open-in-new-tab',
  styleUrls: ['./open-in-new-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shareable-link" htTooltip="Open in a new tab">
      <ht-button
        display="${ButtonStyle.Outlined}"
        [size]="this.size"
        icon="${IconType.OpenInNewTab}"
        (click)="this.openInNewTab()"
      ></ht-button>
    </div>
  `
})
export class OpenInNewTabComponent implements OnInit {
  @Input()
  public size?: ButtonSize = ButtonSize.Medium;

  public url$?: Observable<string>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public ngOnInit(): void {
    this.url$ = merge(this.navigationService.navigation$, this.timeRangeService.getTimeRangeAndChanges()).pipe(
      map(() => this.timeRangeService.getShareableCurrentUrl())
    );
  }

  public openInNewTab(): void {
    this.url$?.subscribe(url =>
      this.navigationService.navigate({
        navType: NavigationParamsType.External,
        windowHandling: ExternalNavigationWindowHandling.NewWindow,
        url: url
      })
    );
  }
}
