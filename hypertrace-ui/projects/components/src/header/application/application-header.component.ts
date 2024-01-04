import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GlobalHeaderHeightProviderService, NavigationService } from '@hypertrace/common';

@Component({
  selector: 'ht-application-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./application-header.component.scss'],
  template: `
    <div class="ht-header" [style.height]="this.headerHeightProvider.globalHeaderHeight">
      <div class="left-side">
        <div class="logo" (click)="this.onLogoClick()">
          <ng-content select="[logo]"></ng-content>
        </div>
        <div class="divider"></div>
        <div class="left-side-content">
          <ng-content select="[left]"></ng-content>
        </div>
        <ng-container *ngIf="this.showTimeRange">
          <div class="time-range">
            <ht-time-range></ht-time-range>
          </div>
        </ng-container>
      </div>
      <div class="right-side-content">
        <ng-content></ng-content>
        <ng-content select="[right]"></ng-content>
      </div>
    </div>
  `,
})
export class ApplicationHeaderComponent {
  @Input()
  public showTimeRange: boolean = true;

  public constructor(
    public readonly headerHeightProvider: GlobalHeaderHeightProviderService,
    private readonly navigationService: NavigationService,
  ) {}

  public onLogoClick(): void {
    this.navigationService.navigateWithinApp(['']); // Empty route so we go to default screen
  }
}
