import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { ButtonStyle } from '../button/button';

@Component({
  selector: 'htc-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./not-found.component.scss'],
  template: `
    <div class="not-found-container fill-container">
      <div class="not-found-message">The requested page is not available</div>
      <htc-button
        class="navigate-home-button"
        label="Take me home"
        (click)="this.goHome()"
        display="${ButtonStyle.Bordered}"
      ></htc-button>
    </div>
  `
})
export class NotFoundComponent {
  public constructor(private readonly navService: NavigationService) {}
  public goHome(): void {
    this.navService.navigateToHome();
  }
}
