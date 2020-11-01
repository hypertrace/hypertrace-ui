import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { Observer } from 'rxjs';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-snackbar',
  styleUrls: ['./snackbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="snackbar-container">
      <ht-icon
        [ngClass]="this.matData.mode"
        class="status-icon"
        [icon]="this.iconType"
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
export class SnackbarComponent {
  public iconType?: IconType;
  public constructor(@Inject(MAT_SNACK_BAR_DATA) public readonly matData: SnackbarData) {
    this.setIconType(this.matData.mode);
  }

  public setIconType(mode: SnackbarMode): void {
    switch (mode) {
      case SnackbarMode.Success:
        this.iconType = IconType.Checkmark;
        break;
      case SnackbarMode.Failure:
        this.iconType = IconType.Close;
        break;
      case SnackbarMode.Info:
        this.iconType = IconType.Info;
        break;
      default:
        assertUnreachable(mode);
    }
  }

  public close(): void {
    this.matData.closedObserver.next(undefined);
  }
}

export enum SnackbarMode {
  Success = 'success',
  Failure = 'failure',
  Info = 'info'
}

export interface SnackbarData {
  mode: SnackbarMode;
  message: string;
  closedObserver: Observer<unknown>;
}
