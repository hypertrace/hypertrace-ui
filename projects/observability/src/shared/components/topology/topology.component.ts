import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Topology,
  TopologyDataSpecifier,
  TopologyEdgeInteractionHandler,
  TopologyEdgeRenderer,
  TopologyLayout,
  TopologyLayoutType,
  TopologyNode,
  TopologyNodeInteractionHandler,
  TopologyNodeRenderer,
  TopologyTooltipRenderer
} from './topology';
import { TopologyBuilderService } from './topology-builder.service';

@Component({
  selector: 'ht-topology',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./topology.component.scss'],
  template: ` <div #topologyContainer (htLayoutChange)="this.redraw()" class="topology"></div> `
})
export class TopologyComponent implements OnChanges, OnDestroy {
  @Input()
  public nodes?: TopologyNode[];

  @Input()
  public nodeRenderer?: TopologyNodeRenderer;

  @Input()
  public edgeRenderer?: TopologyEdgeRenderer;

  @Input()
  public tooltipRenderer?: TopologyTooltipRenderer;

  @Input()
  public nodeDataSpecifiers?: TopologyDataSpecifier[];

  @Input()
  public edgeDataSpecifiers?: TopologyDataSpecifier[];

  @Input()
  public nodeInteractionHandler?: TopologyNodeInteractionHandler;

  @Input()
  public edgeInteractionHandler?: TopologyEdgeInteractionHandler;

  @Input()
  public showBrush?: boolean = true;

  @Input()
  public shouldAutoZoomToFit?: boolean = false;

  @Input()
  public layoutType?: TopologyLayoutType;

  @Input()
  public customLayout?: TopologyLayout; // This will override `layoutType` property

  @Input()
  public supportGroupNode?: boolean;

  @ViewChild('topologyContainer', { static: true })
  private readonly container!: ElementRef;

  private topology?: Topology;

  public constructor(
    private readonly injector: Injector,
    private readonly topologyBuilderService: TopologyBuilderService
  ) {}

  public ngOnChanges(): void {
    this.topology && this.topology.destroy();
    if (!this.nodes || !this.nodeRenderer || !this.edgeRenderer) {
      return;
    }

    this.topology = this.topologyBuilderService.build(this.container.nativeElement, this.injector, {
      nodes: this.nodes,
      nodeRenderer: this.nodeRenderer,
      edgeRenderer: this.edgeRenderer,
      nodeDataSpecifiers: this.nodeDataSpecifiers,
      edgeDataSpecifiers: this.edgeDataSpecifiers,
      tooltipRenderer: this.tooltipRenderer,
      showBrush: this.showBrush,
      shouldAutoZoomToFit: this.shouldAutoZoomToFit,
      nodeInteractionHandler: this.nodeInteractionHandler,
      edgeInteractionHandler: this.edgeInteractionHandler,
      layoutType: this.layoutType,
      customLayout: this.customLayout,
      supportGroupNode: this.supportGroupNode
    });

    // Angular doesn't like introducing new child views mid-change detection
    setTimeout(() => this.redraw());
  }

  public ngOnDestroy(): void {
    this.topology && this.topology.destroy();
  }

  public redraw(): void {
    this.topology && this.topology.draw();
  }
}
