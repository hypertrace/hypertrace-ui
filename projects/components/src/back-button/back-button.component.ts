import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-back-button',
  template: `
    <div (click)="this.onClickBack()" class="back">
      <ht-icon icon="${IconType.ArrowLeft}" size="${IconSize.Small}" class="arrow"></ht-icon>
      <ht-label label="Back" class="label"></ht-label>
    </div>
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
