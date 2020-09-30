import { ChangeDetectionStrategy, Component, Inject, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonSize, ButtonStyle } from '../../button/button';
import { ModalOverlayConfig, ModalSize, MODAL_DATA } from './modal';
import { ModalRef } from './modal-ref';

@Component({
  selector: 'ht-modal-overlay',
  styleUrls: ['./modal-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="modal-overlay" [ngClass]="'modal-size-' + this.size">
      <div *ngIf="this.showHeader" class="header">
        <ht-button
          class="close-button"
          icon="${IconType.Close}"
          display="${ButtonStyle.Outlined}"
          size="${ButtonSize.ExtraSmall}"
          htTooltip="Close modal"
          (click)="this.close()"
        >
        </ht-button>
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

  public constructor(private readonly modalRef: ModalRef, @Inject(MODAL_DATA) config: ModalOverlayConfig<unknown>) {
    this.showHeader = config.showHeader === true;
    this.modalTitle = config.title === undefined ? '' : config.title;
    this.size = config.size;
    this.isComponentModal = !(config.content instanceof TemplateRef);
    this.renderer = config.content;
  }

  public close(): void {
    this.visible = false;
    this.modalRef.close(false);
  }
}
