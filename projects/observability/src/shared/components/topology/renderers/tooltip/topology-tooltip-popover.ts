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
    this.popoverSubject = new BehaviorSubject(this.buildPopover(null, false));
    this.hidden$ = this.popoverSubject.pipe(switchMap(popover => merge(popover.hidden$, popover.closed$)));
  }

  public showWithNodeData(node: TopologyNode, options: TopologyTooltipOptions = {}): void {
    this.rebuildPopoverIfNeeded(node, options);
    this.dataSubject.next({
      type: 'node',
      node: node,
      options: options
    });
    this.popover.show();
  }

  public showWithEdgeData(edge: TopologyEdge, options: TopologyTooltipOptions = {}): void {
    this.rebuildPopoverIfNeeded(edge, options);
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

  private rebuildPopoverIfNeeded(node: TopologyNode | TopologyEdge, options: TopologyTooltipOptions): void {
    const modal = !!options.modal;
    if (modal === this.popover.hasBackdrop()) {
      return;
    }

    this.popover.close(); // Close existing popover
    this.popoverSubject.next(this.buildPopover(node, modal));
  }

  private buildPopover(node: any, modal: boolean): PopoverRef {
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
      boundingElement: this.getElementContainer(node?.data?.name, modal),
      offsetX: 50,
      offsetY: 30
    });

    return popover;
  }

  private getElementContainer(textContent: string = '', modal: boolean): HTMLElement {
    if (!modal) {
      return this.container.nativeElement;
    }

    if (textContent) {
      return (
        Array.from(this.container.nativeElement.querySelector('.topology-data').children as HTMLCollection).find(
          el => el.querySelector('text')?.textContent === textContent
        ) ?? this.container.nativeElement
      );
    } else {
      return this.container.nativeElement.querySelector('.topology-data .emphasized');
    }
  }
}
