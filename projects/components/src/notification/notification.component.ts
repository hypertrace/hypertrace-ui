import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
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
    <div class="notification-container" role="alert" [attr.data-alert-type]="this.data.mode">
      <ht-icon
        [ngClass]="this.data.mode"
        class="status-icon"
        [icon]="this.getStatusIconType()"
        size="${IconSize.Small}"
      ></ht-icon>
      <div class="content-template" *ngIf="this.isContentTemplate; else textMessageTpl">
        <ng-container *ngTemplateOutlet="this.template"></ng-container>
      </div>
      <ht-icon
        class="dismiss-icon"
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        (click)="this.close()"
      ></ht-icon>

      <ng-template #textMessageTpl>
        <div class="text">{{ this.data.message }}</div>
      </ng-template>
    </div>
  `
})
export class NotificationComponent {
  public constructor(@Inject(MAT_SNACK_BAR_DATA) public readonly data: NotificationData) {}

  public getStatusIconType(): IconType {
    switch (this.data.mode) {
      case NotificationMode.Success:
        return IconType.CheckCircle;
      case NotificationMode.Failure:
        return IconType.Alert;
      case NotificationMode.Info:
        return IconType.Info;
      default:
        return assertUnreachable(this.data.mode);
    }
  }

  public get isContentTemplate(): boolean {
    return this.data.message instanceof TemplateRef;
  }

  public get template(): TemplateRef<unknown> {
    return this.data.message as TemplateRef<unknown>;
  }

  public close(): void {
    this.data.closedObserver.next();
  }
}

export const enum NotificationMode {
  Success = 'success',
  Failure = 'failure',
  Info = 'info'
}

export interface NotificationData {
  mode: NotificationMode;
  message: NotificationContent;
  closedObserver: Observer<void>;
}

export type NotificationContent = string | TemplateRef<unknown>;
