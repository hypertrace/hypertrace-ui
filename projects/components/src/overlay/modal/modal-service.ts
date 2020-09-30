import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { Subscription } from 'rxjs';
import {
  PopoverContainerComponent,
  PopoverContainerData,
  POPOVER_CONTAINER_DATA
} from '../../popover/container/popover-container.component';
import { PopoverBackdrop } from '../../popover/popover';
import { PopoverPositionBuilder } from '../../popover/popover-position-builder';
import { ModalOptions, ModalOverlayConfig, ModalPosition, MODAL_DATA } from './modal';
import { ModalOverlayComponent } from './modal-overlay.component';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private activeModalPopover?: ModalRef;
  private modalCloseSubscription?: Subscription;

  public constructor(
    public readonly overlay: Overlay,
    public readonly defaultInjector: Injector,
    public readonly positionBuilder: PopoverPositionBuilder,
    public readonly navigationService: NavigationService
  ) {}

  public ngOnDestroy(): void {
    this.modalCloseSubscription?.unsubscribe();
  }

  public createModal<TData = unknown>(
    config: ModalOverlayConfig<TData>,
    injector: Injector = this.defaultInjector
  ): ModalRef {
    const modal = this.drawModal({
      componentOrTemplate: ModalOverlayComponent,
      parentInjector: injector,
      data: config,
      backdrop: PopoverBackdrop.Opaque
    });

    modal.closeOnNavigation();
    this.setActiveModalPopover(modal);

    return modal;
  }

  public drawModal<TData = unknown>(options: ModalOptions<TData>): ModalRef {
    const positionStrategy = this.positionBuilder.buildPositionStrategy(ModalPosition);
    const overlayRef = this.overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: this.hasBackdrop(options.backdrop),
      backdropClass: this.getBackdropClass(options.backdrop)
    });

    const modalRef = new ModalRef(overlayRef, this.navigationService);

    modalRef.initialize(this.convertToPortal(options, modalRef));

    if (positionStrategy) {
      modalRef.show();
    }

    return modalRef;
  }

  protected convertToPortal(
    options: ModalOptions<unknown>,
    modalRef: ModalRef
  ): ComponentPortal<unknown> & { injector: Injector } {
    return new ComponentPortal<unknown>(
      PopoverContainerComponent,
      undefined,
      this.buildContainerInjector(options, modalRef)
    ) as ComponentPortal<unknown> & { injector: Injector };
  }

  private buildContainerInjector(options: ModalOptions<unknown>, modalRef: ModalRef): Injector {
    const parentInjector = options.parentInjector || this.defaultInjector;

    return Injector.create({
      providers: [
        {
          provide: POPOVER_CONTAINER_DATA,
          useValue: this.buildContainerData(options, modalRef)
        }
      ],
      parent: parentInjector
    });
  }

  private buildContainerData(options: ModalOptions<unknown>, modalRef: ModalRef): PopoverContainerData {
    return {
      popoverRenderer: options.componentOrTemplate,
      popoverInjector: this.buildModalInjector(options, modalRef)
    };
  }

  protected buildModalInjector(options: ModalOptions<unknown>, modalRef: ModalRef): Injector {
    // Child of provided injector, sibling to container injector
    const parentInjector = options.parentInjector || this.defaultInjector;

    return Injector.create({
      providers: [
        {
          provide: MODAL_DATA,
          useValue: options.data
        },
        {
          provide: ModalRef,
          useValue: modalRef
        }
      ],
      parent: parentInjector
    });
  }

  protected hasBackdrop(backdrop?: PopoverBackdrop): boolean {
    return backdrop === PopoverBackdrop.Opaque || backdrop === PopoverBackdrop.Transparent;
  }

  protected getBackdropClass(backdrop?: PopoverBackdrop): string {
    switch (backdrop) {
      case PopoverBackdrop.Transparent:
        return 'cdk-overlay-transparent-backdrop';
      case PopoverBackdrop.Opaque:
        return 'modal-overlay-backdrop';
      case PopoverBackdrop.None:
      default:
        return '';
    }
  }

  private setActiveModalPopover(modalRef: ModalRef): void {
    this.modalCloseSubscription?.unsubscribe();
    this.activeModalPopover?.close();

    this.activeModalPopover = modalRef;
    this.activeModalPopover.closeOnNavigation();
    this.modalCloseSubscription = this.activeModalPopover.closed$.subscribe(
      () => (this.activeModalPopover = undefined)
    );
  }
}
