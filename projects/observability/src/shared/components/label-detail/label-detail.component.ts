import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import {
  ButtonRole,
  ButtonSize,
  ButtonStyle,
  IconSize,
  PopoverRef,
  PopoverRelativePositionLocation
} from '@hypertrace/components';

@Component({
  selector: 'ht-label-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./label-detail.component.scss'],
  template: `
    <ht-event-blocker event="click">
      <div class="label-detail" *ngIf="this.label">
        <ht-popover
          [closeOnClick]="false"
          [closeOnNavigate]="true"
          [locationPreferences]="this.locationPreferences"
          (popoverOpen)="this.onPopoverOpen($event)"
        >
          <ht-popover-trigger>
            <div
              class="label-detail-trigger"
              (mouseenter)="this.showdetailButton = true"
              (mouseleave)="this.showdetailButton = false"
            >
              <ht-button
                *ngIf="this.showdetailButton"
                class="expand icon detail-button"
                icon="${IconType.Collapsed}"
                size="${ButtonSize.Small}"
                role="${ButtonRole.Tertiary}"
                display="${ButtonStyle.Text}"
              ></ht-button>
              <ht-icon
                *ngIf="this.icon && !this.showdetailButton"
                class="icon label-icon"
                [icon]="this.icon"
                size="${IconSize.Small}"
              ></ht-icon>
              <ht-label [label]="this.label" class="label"></ht-label>
            </div>
          </ht-popover-trigger>

          <ht-popover-content>
            <div class="popover-content">
              <div class="label-display">
                <ht-button
                  class="expanded close"
                  icon="${IconType.Expanded}"
                  size="${ButtonSize.Small}"
                  role="${ButtonRole.Secondary}"
                  display="${ButtonStyle.Text}"
                  (click)="this.onClickClose()"
                ></ht-button>
                <ht-label [label]="this.label" class="label"></ht-label>
              </div>
              <div class="description" *ngIf="this.description">{{ this.description }}</div>
              <div class="details" *ngIf="this.additionalDetails">
                <ng-container *ngFor="let detail of this.additionalDetails">
                  <span class="symbol"></span>
                  <span class="text">{{ detail }}</span>
                </ng-container>
              </div>
            </div>
          </ht-popover-content>
        </ht-popover>
      </div>
    </ht-event-blocker>
  `
})
export class LabelDetailComponent {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @Input()
  public description?: string;

  @Input()
  public additionalDetails?: string[] = [];

  public showdetailButton: boolean = false;
  public locationPreferences: PopoverRelativePositionLocation[] = [PopoverRelativePositionLocation.OverLeftAligned];

  private popoverRef?: PopoverRef;

  public onPopoverOpen(popoverRef: PopoverRef): void {
    this.popoverRef = popoverRef;
  }

  public onClickClose(): void {
    this.popoverRef?.close();
    this.popoverRef = undefined;
  }
}
