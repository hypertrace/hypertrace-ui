import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import {
  PopoverContainerComponent,
  PopoverContainerData,
  POPOVER_CONTAINER_DATA
} from './container/popover-container.component';
import { PopoverBackdrop, PopoverOptions, POPOVER_DATA } from './popover';
import { PopoverPositionBuilder } from './popover-position-builder';
import { PopoverRef } from './popover-ref';

@Injectable()
export class PopoverService {
  public constructor(
    private readonly overlay: Overlay,
    private readonly defaultInjector: Injector,
    private readonly positionBuilder: PopoverPositionBuilder,
    private readonly navigationService: NavigationService
  ) {}

  public drawPopover<TData = unknown>(options: PopoverOptions<TData>): PopoverRef {
    const initialPositionStrategy = this.positionBuilder.buildPositionStrategy(options.position);
    const overlayRef = this.overlay.create({
      positionStrategy: initialPositionStrategy,
      hasBackdrop: this.hasBackdrop(options.backdrop),
      backdropClass: this.getBackdropClass(options.backdrop)
    });

    const popoverRef = new PopoverRef(overlayRef, this.positionBuilder, this.navigationService);

    popoverRef.initialize(this.convertToPortal(options, popoverRef));

    if (initialPositionStrategy) {
      popoverRef.show();
    }

    return popoverRef;
  }

  private convertToPortal(
    options: PopoverOptions<unknown>,
    popoverRef: PopoverRef
  ): ComponentPortal<unknown> & { injector: Injector } {
    return new ComponentPortal<unknown>(
      PopoverContainerComponent,
      undefined,
      this.buildContainerInjector(options, popoverRef)
    ) as ComponentPortal<unknown> & { injector: Injector };
  }

  private buildContainerInjector(options: PopoverOptions<unknown>, popoverRef: PopoverRef): Injector {
    const parentInjector = options.parentInjector || this.defaultInjector;

    return Injector.create({
      providers: [
        {
          provide: POPOVER_CONTAINER_DATA,
          useValue: this.buildContainerData(options, popoverRef)
        }
      ],
      parent: parentInjector
    });
  }

  private buildContainerData(options: PopoverOptions<unknown>, popoverRef: PopoverRef): PopoverContainerData {
    return {
      popoverRenderer: options.componentOrTemplate,
      popoverInjector: this.buildPopoverInjector(options, popoverRef)
    };
  }

  private buildPopoverInjector(options: PopoverOptions<unknown>, popoverRef: PopoverRef): Injector {
    // Child of provided injector, sibling to container injector
    const parentInjector = options.parentInjector || this.defaultInjector;

    return Injector.create({
      providers: [
        {
          provide: POPOVER_DATA,
          useValue: options.data
        },
        {
          provide: PopoverRef,
          useValue: popoverRef
        }
      ],
      parent: parentInjector
    });
  }

  private hasBackdrop(backdrop?: PopoverBackdrop): boolean {
    return backdrop === PopoverBackdrop.Opaque || backdrop === PopoverBackdrop.Transparent;
  }

  private getBackdropClass(backdrop?: PopoverBackdrop): string {
    switch (backdrop) {
      case PopoverBackdrop.Transparent:
        return 'cdk-overlay-transparent-backdrop';
      case PopoverBackdrop.Opaque:
        return 'opaque-backdrop';
      case PopoverBackdrop.None:
      default:
        return '';
    }
  }
}
