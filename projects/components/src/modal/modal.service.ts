import { Injectable, Injector } from '@angular/core';
import { PopoverBackdrop, PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { DefaultModalRef } from './default-modal-ref';
import { ModalConfig, ModalRef, MODAL_DATA } from './modal';
import { ModalConstructionData, ModalContainerComponent } from './modal-container.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModal?: ModalRef<unknown>;

  public constructor(private readonly popoverService: PopoverService, private readonly defaultInjector: Injector) {}

  public createModal<TData, TResponse = never>(
    config: ModalConfig<TData>,
    injector: Injector = this.defaultInjector
  ): ModalRef<TResponse> {
    this.activeModal?.close();

    const newModal = new DefaultModalRef();
    this.activeModal = newModal;

    const popover = this.buildPopover(injector, this.buildMetadata(config, newModal, injector));
    newModal.initialize(popover);

    return newModal as ModalRef<TResponse>;
  }

  private buildMetadata(
    config: ModalConfig,
    modalRef: ModalRef<unknown>,
    parentInjector: Injector
  ): ModalConstructionData {
    return {
      config: config,
      injector: Injector.create({
        providers: [
          {
            provide: MODAL_DATA,
            useValue: config.data
          },
          {
            provide: ModalRef,
            useValue: modalRef
          }
        ],
        parent: parentInjector
      })
    };
  }

  private buildPopover(injector: Injector, modalContainerData: ModalConstructionData): PopoverRef {
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: ModalContainerComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Centered
      },
      data: modalContainerData,
      backdrop: PopoverBackdrop.Opaque
    });

    popover.closeOnNavigation();

    return popover;
  }
}
