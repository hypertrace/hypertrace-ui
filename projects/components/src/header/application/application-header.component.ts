import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { GLOBAL_HEADER_HEIGHT, NavigationService } from '@hypertrace/common';

@Component({
  selector: 'ht-application-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./application-header.component.scss'],
  template: `
    <div class="ht-header" [style.height]="this.height">
      <div class="left-side">
        <div class="logo" (click)="this.onLogoClick()">
          <ng-content select="[logo]"></ng-content>
        </div>
        <div class="divider"></div>
        <div class="left-side-content">
          <ng-content select="[left]"></ng-content>
        </div>
        <div class="time-range" *ngIf="this.showTimeRange">
          <ht-time-range></ht-time-range>
        </div>
      </div>
      <div class="right-side-content">
        <ng-content></ng-content>
        <ng-content select="[right]"></ng-content>
      </div>
    </div>
  `
})
export class ApplicationHeaderComponent {
  @Input()
  public showTimeRange: boolean = true;

  public constructor(
    @Inject(GLOBAL_HEADER_HEIGHT) public readonly height: string,
    private readonly navigationService: NavigationService
  ) {}

  public onLogoClick(): void {
    this.navigationService.navigateWithinApp(['']); // Empty route so we go to default screen
  }
}
