import { ChangeDetectionStrategy, Component, HostListener, Inject, Injector, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { LayoutChangeService } from '@hypertrace/common';
import { ButtonSize, ButtonStyle } from '../button/button';
import { POPOVER_DATA } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { getModalDimensions, ModalConfig, ModalDimension, ModalSize, MODAL_DATA } from './modal';

@Component({
  selector: 'ht-modal-container',
  styleUrls: ['./modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.visible"
      class="modal-container"
      [ngClass]="'modal-size-' + this.size"
      [style.height]="this.dimension.height"
      [style.width]="this.dimension.width"
    >
      <div class="header">
        <ht-button
          *ngIf="this.showControls"
          class="close-button"
          icon="${IconType.Close}"
          display="${ButtonStyle.Outlined}"
          size="${ButtonSize.Tiny}"
          htTooltip="Close modal"
          (click)="this.close()"
        >
        </ht-button>
        <h3 *ngIf="this.modalTitle" class="header-title">{{ this.modalTitle }}</h3>
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
  public readonly showControls: boolean;
  public readonly size?: ModalSize;
  public readonly dimension: ModalDimension;
  public readonly isComponentModal: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;
  public readonly rendererInjector: Injector;
  public readonly rendererContext: unknown;
  public readonly closeOnEscape: boolean;

  public visible: boolean = true;

  public constructor(
    private readonly popoverRef: PopoverRef,
    @Inject(POPOVER_DATA) constructionData: ModalConstructionData,
    layoutChange: LayoutChangeService
  ) {
    const config = constructionData.config;
    this.showControls = config.showControls ?? false;
    this.modalTitle = config.title ?? '';
    this.size = config.size;
    this.dimension = config.dimension
      ? this.getDimensionsWithUnits(config.dimension)
      : this.getDimensionsWithUnits(getModalDimensions(this.size));
    this.isComponentModal = !(config.content instanceof TemplateRef);
    this.closeOnEscape = config.closeOnEscapeKey ?? true;
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

  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(): void {
    if (this.closeOnEscape) {
      this.close();
    }
  }

  public close(): void {
    this.visible = false;
    this.popoverRef.close();
  }

  private getDimensionsWithUnits(dims: ModalDimension): ModalDimension {
    const dimsWithUnits: ModalDimension = { ...dims };
    if (typeof dims.height === 'number') {
      dimsWithUnits.height = `${dims.height}px`;
    }

    if (typeof dims.width === 'number') {
      dimsWithUnits.width = `${dims.width}px`;
    }

    return dimsWithUnits;
  }
}

export interface ModalConstructionData {
  config: ModalConfig;
  injector: Injector;
}
