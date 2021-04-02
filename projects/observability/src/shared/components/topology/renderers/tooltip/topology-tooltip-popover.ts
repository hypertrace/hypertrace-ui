import { ElementRef, Injector } from '@angular/core';
import { PopoverBackdrop, PopoverPositionType, PopoverRef, PopoverService } from '@hypertrace/components';
import { BehaviorSubject, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TopologyEdge, TopologyNode, TopologyTooltip, TopologyTooltipOptions } from '../../topology';
import { TooltipDefinition, TopologyTooltipData } from './topology-tooltip-renderer.service';

export class TopologyTooltipPopover implements TopologyTooltip {
  private readonly dataSubject: Subject<TopologyTooltipData> = new ReplaySubject<TopologyTooltipData>(1);
  private readonly popoverSubject: BehaviorSubject<PopoverRef>;
  private get popover(): PopoverRef {
    return this.popoverSubject.getValue();
  }

  public readonly hidden$: Observable<void>;

  public constructor(
    private readonly tooltipDefinition: TooltipDefinition,
    private readonly container: ElementRef,
    private readonly injector: Injector,
    private readonly popoverService: PopoverService
  ) {
    this.popoverSubject = new BehaviorSubject(this.buildPopover(false, this.container));
    this.hidden$ = this.popoverSubject.pipe(switchMap(popover => merge(popover.hidden$, popover.closed$)));
  }

  public showWithNodeData(node: TopologyNode, origin: ElementRef, options: TopologyTooltipOptions = {}): void {
    this.rebuildPopoverIfNeeded(origin, options);
    this.dataSubject.next({
      type: 'node',
      node: node,
      options: options
    });
    this.popover.show();
  }

  public showWithEdgeData(edge: TopologyEdge, origin: ElementRef, options: TopologyTooltipOptions = {}): void {
    this.rebuildPopoverIfNeeded(origin, options);
    this.dataSubject.next({
      type: 'edge',
      edge: edge,
      options: options
    });
    this.popover.show();
  }

  public hide(): void {
    this.popover.hide();
  }

  public destroy(): void {
    this.dataSubject.complete();
    this.popover.close();
    this.popoverSubject.complete();
  }

  private rebuildPopoverIfNeeded(origin: ElementRef, options: TopologyTooltipOptions): void {
    const modal = !!options.modal;
    if (modal === this.popover.hasBackdrop()) {
      return;
    }

    this.popover.close(); // Close existing popover
    this.popoverSubject.next(this.buildPopover(!!options.modal, origin));
  }

  // private buildHiddenPopover(): PopoverRef {
  //   const popover = this.popoverService.drawPopover({
  //     componentOrTemplate: this.tooltipDefinition.class,
  //     position: {
  //       type: PopoverPositionType.Hidden
  //     },
  //     parentInjector: this.injector,
  //     backdrop: PopoverBackdrop.None,
  //     data: this.dataSubject
  //   });

  //   return popover;
  // }

  private buildPopover(modal: boolean, origin: ElementRef): PopoverRef {
    console.log('entro aca');
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: this.tooltipDefinition.class,
      position: {
        type: PopoverPositionType.Hidden
      },
      parentInjector: this.injector,
      backdrop: modal ? PopoverBackdrop.Transparent : PopoverBackdrop.None,
      data: this.dataSubject
    });

    if (modal) {
      popover.hideOnBackdropClick();
    }

    popover.updatePositionStrategy({
      type: PopoverPositionType.FollowMouse,
      boundingElement: modal ? origin.nativeElement : this.container.nativeElement,
      offsetX: 50,
      offsetY: 30
    });

    return popover;
  }
}
