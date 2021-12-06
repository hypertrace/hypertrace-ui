import { PopoverPositionType, PopoverRef } from '@hypertrace/components';
import { Observer } from 'rxjs';
import { MouseLocationData } from '../mouse-tracking/mouse-tracking';

export class ChartTooltipPopover<TData, TContext> implements ChartTooltipRef<TData, TContext> {
  private boundElement?: Element;

  public constructor(
    private readonly popoverRef: PopoverRef,
    private readonly dataObserver: Observer<MouseLocationData<TData, TContext>[]>
  ) {}

  public showWithData(element: Element, data: MouseLocationData<TData, TContext>[]): void {
    this.updatePositionStrategyIfNeeded(element);
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

  private updatePositionStrategyIfNeeded(element: Element): void {
    if (this.boundElement !== element) {
      this.popoverRef.updatePositionStrategy({
        type: PopoverPositionType.FollowMouse,
        boundingElement: element,
        offsetX: 20,
        offsetY: 30
      });
      this.boundElement = element;
    }
  }
}

export interface ChartTooltipRef<TData, TContext = unknown> {
  showWithData(relativeTo: Element, data: MouseLocationData<TData, TContext>[]): void;
  hide(): void;
  destroy(): void;
}
