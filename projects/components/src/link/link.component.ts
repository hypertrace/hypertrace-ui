import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';

@Component({
  selector: 'htc-link',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a *ngIf="this.shouldShowLink" class="htc-link" (click)="this.navigateToUrl()">
      <ng-content></ng-content>
    </a>
  `
})
export class LinkComponent {
  @Input()
  public url: string | undefined;

  /**
   * Returns true if URL is defined and not an empty string
   */
  public get shouldShowLink(): boolean {
    return !isEmpty(this.url);
  }

  /**
   * Navigate to the URL relatively or absolutely based on the
   * pattern of the URL
   */
  public navigateToUrl(): void {
    const url = this.url ?? '';

    if (url === '') {
      return;
    }

    if (this.navigationService.isExternalUrl(url)) {
      this.navigationService.navigateExternal(url);
    } else {
      this.navigationService.navigateWithinApp(url);
    }
  }

  public constructor(private readonly navigationService: NavigationService) {}
}
