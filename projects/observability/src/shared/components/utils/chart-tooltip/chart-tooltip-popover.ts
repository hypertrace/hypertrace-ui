import { PopoverPositionType, PopoverRef } from '@hypertrace/components';
import { Observable, Observer } from 'rxjs';
import { MouseLocationData } from '../mouse-tracking/mouse-tracking';

export class ChartTooltipPopover<TData, TContext> implements ChartTooltipRef<TData, TContext> {
  private boundElement?: Element;
  public readonly hovered$: Observable<boolean>;

  public constructor(
    private readonly popoverRef: PopoverRef,
    private readonly dataObserver: Observer<MouseLocationData<TData, TContext>[]>
  ) {
    this.hovered$ = popoverRef.hovered$;
  }

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
        offsetX: 0,
        offsetY: 0
      });
      this.boundElement = element;
    }
  }
}

export interface ChartTooltipRef<TData, TContext = unknown> {
  showWithData(relativeTo: Element, data: MouseLocationData<TData, TContext>[]): void;
  hide(): void;
  destroy(): void;
  hovered$: Observable<boolean>;
}
