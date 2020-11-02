import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { Observer } from 'rxjs';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-notification',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notification-container">
      <ht-icon
        [ngClass]="this.matData.mode"
        class="status-icon"
        [icon]="this.getStatusIconType()"
        size="${IconSize.Small}"
      ></ht-icon>
      <div class="text">{{ this.matData.message }}</div>
      <ht-icon
        class="dismiss-icon"
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        (click)="this.close()"
      ></ht-icon>
    </div>
  `
})
export class NotificationComponent {
  public constructor(@Inject(MAT_SNACK_BAR_DATA) public readonly matData: SnackbarData) {}

  public getStatusIconType(): IconType | undefined {
    switch (this.matData.mode) {
      case SnackbarMode.Success:
        return IconType.Checkmark;
      case SnackbarMode.Failure:
        return IconType.Close;
      case SnackbarMode.Info:
        return IconType.Info;
      default:
        assertUnreachable(this.matData.mode);
    }
  }

  public close(): void {
    this.matData.closedObserver.next();
  }
}

export const enum SnackbarMode {
  Success = 'success',
  Failure = 'failure',
  Info = 'info'
}

export interface SnackbarData {
  mode: SnackbarMode;
  message: string;
  closedObserver: Observer<void>;
}
