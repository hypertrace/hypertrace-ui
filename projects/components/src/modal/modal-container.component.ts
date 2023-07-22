import { ChangeDetectionStrategy, Component, HostListener, Inject, Injector, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Dictionary, LayoutChangeService } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { ButtonSize, ButtonStyle } from '../button/button';
import { POPOVER_DATA } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { getModalDimensions, ModalConfig, ModalDimension, MODAL_DATA } from './modal';

@Component({
  selector: 'ht-modal-container',
  styleUrls: ['./modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="modal-container" [style]="this.styles">
      <div class="header">
        <ht-button
          *ngIf="this.showControls"
          class="close-button"
          icon="${IconType.Close}"
          display="${ButtonStyle.Outlined}"
          size="${ButtonSize.Tiny}"
          htTooltip="Close modal"
          ariaLabel="Close"
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
  public readonly size: ModalDimension;
  public readonly isComponentModal: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;
  public readonly rendererInjector: Injector;
  public readonly rendererContext: unknown;
  public readonly closeOnEscape: boolean;
  public readonly styles: Dictionary<unknown>;

  public visible: boolean = true;

  public constructor(
    private readonly popoverRef: PopoverRef,
    @Inject(POPOVER_DATA) constructionData: ModalConstructionData,
    layoutChange: LayoutChangeService
  ) {
    const config = constructionData.config;
    this.showControls = config.showControls ?? false;
    this.modalTitle = config.title ?? '';
    this.size = this.isModalDimension(config.size)
      ? this.getDimensionsWithUnits(config.size)
      : this.getDimensionsWithUnits(getModalDimensions(config.size));
    this.styles = { ...config.styles, ...this.getDimensionStyles() };
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

  private isModalDimension(size: unknown): size is ModalDimension {
    return typeof size === 'object' && size !== null && 'width' in (size as ModalDimension);
  }

  private getDimensionsWithUnits(dims: ModalDimension): ModalDimension {
    const dimsWithUnits: ModalDimension = { ...dims };
    if (typeof dims.height === 'number') {
      dimsWithUnits.height = `${dims.height}px`;
    }

    if (typeof dims.width === 'number') {
      dimsWithUnits.width = `${dims.width}px`;
    }

    if (typeof dims.maxHeight === 'number') {
      dimsWithUnits.maxHeight = `${dims.maxHeight}px`;
    }

    if (typeof dims.maxWidth === 'number') {
      dimsWithUnits.maxWidth = `${dims.maxWidth}px`;
    }

    if (typeof dims.minHeight === 'number') {
      dimsWithUnits.minHeight = `${dims.minHeight}px`;
    }

    if (typeof dims.minWidth === 'number') {
      dimsWithUnits.minWidth = `${dims.minWidth}px`;
    }

    return dimsWithUnits;
  }

  private getDimensionStyles(): Dictionary<unknown> {
    return {
      height: this.size.height,
      width: this.size.width,
      ...(!isNil(this.size.minHeight) ? { 'min-height': this.size.minHeight } : {}),
      ...(!isNil(this.size.minWidth) ? { 'min-width': this.size.minWidth } : {}),
      ...(!isNil(this.size.maxHeight) ? { 'max-height': this.size.maxHeight } : {}),
      ...(!isNil(this.size.maxWidth) ? { 'max-width': this.size.maxWidth } : {})
    };
  }
}

export interface ModalConstructionData {
  config: ModalConfig;
  injector: Injector;
}
