import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { GLOBAL_HEADER_HEIGHT, NavigationService } from '@hypertrace/common';

@Component({
  selector: 'htc-application-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./application-header.component.scss'],
  template: `
    <div class="htc-header" [style.height]="this.height">
      <div class="left-side">
        <div class="logo" (click)="this.onLogoClick()">
          <ng-content select="[logo]"></ng-content>
        </div>
        <div class="divider"></div>
        <div class="time-range">
          <htc-time-range></htc-time-range>
        </div>
      </div>
      <div class="right-side">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ApplicationHeaderComponent {
  public constructor(
    @Inject(GLOBAL_HEADER_HEIGHT) public readonly height: string,
    private readonly navigationService: NavigationService
  ) {}

  public onLogoClick(): void {
    this.navigationService.navigateWithinApp(['']); // Empty route so we go to default screen
  }
}
