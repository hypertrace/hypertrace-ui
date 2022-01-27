import { PopoverFixedPositionLocation, PopoverPositionType, PopoverRef } from '@hypertrace/components';
import { Observer } from 'rxjs';
import { MouseLocationData } from '../mouse-tracking/mouse-tracking';

export class ChartTooltipPopover<TData, TContext> implements ChartTooltipRef<TData, TContext> {
  private boundElement?: Element;

  public constructor(
    private readonly popoverRef: PopoverRef,
    private readonly dataObserver: Observer<MouseLocationData<TData, TContext>[]>
  ) {}

  public showWithData(element: Element, data: MouseLocationData<TData, TContext>[]): void {
    this.updatePositionStrategyIfNeeded(element, data);
    this.popoverRef.show();
    this.dataObserver.next(data);
  }

  public hide(): void {
    this.popoverRef.hide();
  }

  public destroy(): void {
    this.popoverRef.close();
    this.dataObserver.complete();
  }

  private updatePositionStrategyIfNeeded(element: Element, data: MouseLocationData<TData, TContext>[]): void {
    if (this.boundElement !== element) {
      this.popoverRef.updatePositionStrategy({
        type: PopoverPositionType.FollowMouse,
        boundingElement: element,
        offsetX: 20,
        offsetY: 30
      });
      this.boundElement = element;
    } else {
      const location = data[0]?.location;
      if (location) {
        this.popoverRef.updatePositionStrategy({
          type: PopoverPositionType.Fixed,
          location: PopoverFixedPositionLocation.Custom,
          customLocation: location
        });
      }
    }
  }
}

export interface ChartTooltipRef<TData, TContext = unknown> {
  showWithData(relativeTo: Element, data: MouseLocationData<TData, TContext>[]): void;
  hide(): void;
  destroy(): void;
}
