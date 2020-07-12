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
  TopologyEdgeRenderer,
  TopologyNode,
  TopologyNodeRenderer,
  TopologyTooltipRenderer
} from './topology';
import { TopologyBuilderService } from './topology-builder.service';

@Component({
  selector: 'ht-topology',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./topology.component.scss'],
  template: ` <div #topologyContainer (traceLayoutChange)="this.redraw()" class="topology"></div> `
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
      tooltipRenderer: this.tooltipRenderer
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
