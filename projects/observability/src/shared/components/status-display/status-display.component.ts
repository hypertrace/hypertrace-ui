import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconSize } from '@hypertrace/components';

@Component({
  selector: 'ht-status-display',
  template: ` <div class="status" *ngIf="this.statusCode">
    <ng-container *ngIf="this.statusCode | htStatusDisplayIcon: this.status as icon">
      <ht-icon [icon]="icon" size="${IconSize.ExtraSmall}"></ht-icon>
    </ng-container>
    <span class="text">{{ this.statusCode | htStatusDisplayText: this.statusMessage }}</span>
  </div>`,
  styleUrls: ['./status-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusDisplayComponent {
  @Input()
  public statusCode?: number | string;

  @Input()
  public status?: string;

  @Input()
  public statusMessage?: string;

  // TODO: Add display for different styles if required
}
