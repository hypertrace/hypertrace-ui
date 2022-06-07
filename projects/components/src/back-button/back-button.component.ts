import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { ButtonRole, ButtonStyle } from '../button/button';

@Component({
  selector: 'ht-back-button',
  template: `
    <ht-button
      (click)="this.onClickBack()"
      class="back"
      role="${ButtonRole.Primary}"
      display="${ButtonStyle.PlainText}"
      icon="${IconType.ArrowLeft}"
      label="Back"
    ></ht-button>
  `,
  styleUrls: ['./back-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackButtonComponent {
  public constructor(private readonly navigationService: NavigationService) {}
  public onClickBack(): void {
    this.navigationService.navigateBack();
  }
}
