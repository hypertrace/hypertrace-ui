import { Injectable, Injector } from '@angular/core';
import { PopoverOptions, POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { PopoverService } from '../../popover/popover.service';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class ModalService extends PopoverService {
  public drawPopover<TData = unknown>(options: PopoverOptions<TData>): ModalRef {
    const initialPositionStrategy = this.positionBuilder.buildPositionStrategy(options.position);
    const overlayRef = this.overlay.create({
      positionStrategy: initialPositionStrategy,
      hasBackdrop: this.hasBackdrop(options.backdrop),
      backdropClass: this.getBackdropClass(options.backdrop)
    });

    const modalRef = new ModalRef(new PopoverRef(overlayRef, this.positionBuilder, this.navigationService));

    modalRef.initialize(this.convertToPortal(options, modalRef));

    if (initialPositionStrategy) {
      modalRef.show();
    }

    return modalRef;
  }

  protected buildPopoverInjector(options: PopoverOptions<unknown>, modalRef: ModalRef): Injector {
    // Child of provided injector, sibling to container injector
    const parentInjector = options.parentInjector || this.defaultInjector;

    return Injector.create({
      providers: [
        {
          provide: POPOVER_DATA,
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
}
