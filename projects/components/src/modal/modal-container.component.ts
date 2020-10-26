import { ChangeDetectionStrategy, Component, Inject, Injector, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { LayoutChangeService } from '@hypertrace/common';
import { ButtonSize, ButtonStyle } from '../button/button';
import { POPOVER_DATA } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { ModalConfig, ModalSize, MODAL_DATA } from './modal';

@Component({
  selector: 'ht-modal-container',
  styleUrls: ['./modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="modal-container" [ngClass]="'modal-size-' + this.size">
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
            <ng-container *ngComponentOutlet="this.renderer; injector: this.rendererInjector"></ng-container>
          </ng-container>
          <ng-template #templateRenderer>
            <ng-container *ngTemplateOutlet="this.renderer; context: this.rendererContext"></ng-container>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ModalContainerComponent {
  public readonly modalTitle: string;
  public readonly showHeader: boolean = true;
  public readonly size: ModalSize;
  public readonly isComponentModal: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;
  public readonly rendererInjector: Injector;
  public readonly rendererContext: unknown;

  public visible: boolean = true;

  public constructor(
    private readonly popoverRef: PopoverRef,
    @Inject(POPOVER_DATA) constructionData: ModalConstructionData,
    layoutChange: LayoutChangeService
  ) {
    const config = constructionData.config;
    this.showHeader = config.showHeader === true;
    this.modalTitle = config.title === undefined ? '' : config.title;
    this.size = config.size;
    this.isComponentModal = !(config.content instanceof TemplateRef);
    this.renderer = config.content;
    this.rendererInjector = Injector.create({
      providers: [
        {
          provide: LayoutChangeService,
          useValue: layoutChange
        }
      ],
      parent: constructionData.injector
    });
    this.rendererContext = this.rendererInjector.get(MODAL_DATA, {});
  }

  public close(): void {
    this.visible = false;
    this.popoverRef.close();
  }
}

export interface ModalConstructionData {
  config: ModalConfig;
  injector: Injector;
}
