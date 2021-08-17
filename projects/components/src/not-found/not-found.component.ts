import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { ButtonRole, ButtonStyle } from '../button/button';
import { ImagesAssetPath } from '@hypertrace/assets-library';
@Component({
  selector: 'ht-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./not-found.component.scss'],
  template: `
    <div class="not-found-container fill-container">
      <div class="not-found-content">
        <img class="not-found-image" src="${ImagesAssetPath.ErrorPage}" loading="lazy" alt="not found page" />
        <div class="not-found-message-wrapper">
          <div class="not-found-text-wrapper">
            <div class="not-found-message">Page not found</div>
            <div class="not-found-description">The requested page is not available. This may be an unknown URL.</div>
          </div>
          <ht-button
            class="navigate-home-button"
            label="Go to dashboard"
            (click)="this.goHome()"
            display="${ButtonStyle.Solid}"
            role="${ButtonRole.Primary}"
          ></ht-button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  public constructor(private readonly navService: NavigationService) {}
  public goHome(): void {
    this.navService.navigateToHome();
  }
}
