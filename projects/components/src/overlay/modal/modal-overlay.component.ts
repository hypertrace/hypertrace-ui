import { ChangeDetectionStrategy, Component, Inject, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonSize, ButtonStyle } from '../../button/button';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { ModalOverlayConfig, ModalSize } from './modal';

@Component({
  selector: 'htc-modal-overlay',
  styleUrls: ['./modal-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="modal-overlay" [ngClass]="'modal-size-' + this.size">
      <div *ngIf="this.showHeader" class="header">
        <htc-button
          class="close-button"
          icon="${IconType.Close}"
          display="${ButtonStyle.Outlined}"
          size="${ButtonSize.ExtraSmall}"
          htcTooltip="Close modal"
          (click)="this.close()"
        >
        </htc-button>
        <h3 class="header-title">{{ modalTitle }}</h3>
      </div>
      <div class="content-wrapper">
        <div class="content">
          <ng-container *ngIf="this.isComponentModal; else templateRenderer">
            <ng-container *ngComponentOutlet="this.renderer"></ng-container>
          </ng-container>
          <ng-template #templateRenderer>
            <ng-container *ngTemplateOutlet="this.renderer"></ng-container>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ModalOverlayComponent {
  public readonly modalTitle: string;
  public readonly showHeader: boolean = true;
  public readonly size: ModalSize;
  public readonly isComponentModal: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;

  public visible: boolean = true;

  public constructor(private readonly popoverRef: PopoverRef, @Inject(POPOVER_DATA) config: ModalOverlayConfig) {
    this.showHeader = config.showHeader === true;
    this.modalTitle = config.title === undefined ? '' : config.title;
    this.size = config.size;
    this.isComponentModal = !(config.content instanceof TemplateRef);
    this.renderer = config.content;
  }

  public close(): void {
    this.visible = false;
    this.popoverRef.close();
  }
}
