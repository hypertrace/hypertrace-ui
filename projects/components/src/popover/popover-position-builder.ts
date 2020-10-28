import { ConnectionPositionPair, GlobalPositionStrategy, Overlay, PositionStrategy } from '@angular/cdk/overlay';
import { Inject, Injectable, Optional } from '@angular/core';
import { assertUnreachable, GLOBAL_HEADER_HEIGHT } from '@hypertrace/common';
import {
  PopoverFixedPosition,
  PopoverFixedPositionLocation,
  PopoverMousePosition,
  PopoverPosition,
  PopoverPositionType,
  PopoverRelativePositionLocation
} from './popover';
import { MousePositionStrategy } from './position-strategy/mouse-position-strategy';

@Injectable()
export class PopoverPositionBuilder {
  public constructor(
    private readonly overlay: Overlay,
    @Optional() @Inject(GLOBAL_HEADER_HEIGHT) private readonly headerHeight?: string
  ) {}

  public buildPositionStrategy(position: PopoverPosition): PositionStrategy | undefined {
    switch (position.type) {
      case PopoverPositionType.FollowMouse:
        return this.buildMousePopoverPositionStrategy(position);
      case PopoverPositionType.Fixed:
        return this.buildFixedPositionStrategy(position);
      case PopoverPositionType.Relative:
        return this.overlay
          .position()
          .flexibleConnectedTo(position.origin)
          .withPositions(position.locationPreferences.map(location => this.getPositionPairForLocation(location)));
      case PopoverPositionType.Hidden:
      default:
        return undefined;
    }
  }

  private buildMousePopoverPositionStrategy(popoverPosition: PopoverMousePosition): MousePositionStrategy {
    const bounds = popoverPosition.boundingElement.getBoundingClientRect();
    const flexiblePosition = this.overlay.position().flexibleConnectedTo(bounds);

    return new MousePositionStrategy(
      popoverPosition.boundingElement,
      flexiblePosition,
      popoverPosition.offsetX,
      popoverPosition.offsetY
    );
  }

  private getPositionPairForLocation(location: PopoverRelativePositionLocation): ConnectionPositionPair {
    switch (location) {
      case PopoverRelativePositionLocation.AboveCentered:
        return new ConnectionPositionPair(
          { originX: 'center', originY: 'top' },
          { overlayX: 'center', overlayY: 'bottom' }
        );
      case PopoverRelativePositionLocation.AboveLeftAligned:
        return new ConnectionPositionPair(
          { originX: 'start', originY: 'top' },
          { overlayX: 'start', overlayY: 'bottom' }
        );
      case PopoverRelativePositionLocation.AboveRightAligned:
        return new ConnectionPositionPair({ originX: 'end', originY: 'top' }, { overlayX: 'end', overlayY: 'bottom' });
      case PopoverRelativePositionLocation.BelowCentered:
        return new ConnectionPositionPair(
          { originX: 'center', originY: 'bottom' },
          { overlayX: 'center', overlayY: 'top' }
        );
      case PopoverRelativePositionLocation.BelowLeftAligned:
        return new ConnectionPositionPair(
          { originX: 'start', originY: 'bottom' },
          { overlayX: 'start', overlayY: 'top' }
        );

      case PopoverRelativePositionLocation.BelowRightAligned:
        return new ConnectionPositionPair({ originX: 'end', originY: 'bottom' }, { overlayX: 'end', overlayY: 'top' });
      case PopoverRelativePositionLocation.LeftCentered:
        return new ConnectionPositionPair(
          { originX: 'start', originY: 'center' },
          { overlayX: 'end', overlayY: 'center' }
        );
      case PopoverRelativePositionLocation.RightCentered:
        return new ConnectionPositionPair(
          { originX: 'end', originY: 'center' },
          { overlayX: 'start', overlayY: 'center' }
        );
      case PopoverRelativePositionLocation.InsideTopLeft:
        return new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'top' });
      case PopoverRelativePositionLocation.InsideCenterRight:
        return new ConnectionPositionPair(
          { originX: 'end', originY: 'center' },
          { overlayX: 'end', overlayY: 'center' }
        );
      default:
        return assertUnreachable(location);
    }
  }

  private buildFixedPositionStrategy(popoverPosition: PopoverFixedPosition): GlobalPositionStrategy {
    const globalPosition = this.overlay.position().global();
    switch (popoverPosition.location) {
      case PopoverFixedPositionLocation.Centered:
        return globalPosition.centerHorizontally().centerVertically();
      case PopoverFixedPositionLocation.RightUnderHeader:
      default:
        return globalPosition.right('0').top(this.headerHeight ?? '0');
    }
  }
}
