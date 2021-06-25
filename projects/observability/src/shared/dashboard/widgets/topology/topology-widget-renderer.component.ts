import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty } from '@hypertrace/common';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { EMPTY, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TopologyEdgeRendererService } from '../../../components/topology/renderers/edge/topology-edge-renderer.service';
import { TopologyNodeRendererService } from '../../../components/topology/renderers/node/topology-node-renderer.service';
import { TopologyTooltipRendererService } from '../../../components/topology/renderers/tooltip/topology-tooltip-renderer.service';
import { TopologyDataSpecifier, TopologyNode } from '../../../components/topology/topology';
import { INTERACTION_SCOPE } from '../../../graphql/model/schema/entity';
import { ErrorPercentageMetricValueCategory } from '../../../graphql/model/schema/specifications/error-percentage-aggregation-specification';
import { MetricAggregationSpecification } from '../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { PercentileLatencyMetricValueCategory } from '../../../graphql/model/schema/specifications/percentile-latency-aggregation-specification';
import { TopologyData } from '../../data/graphql/topology/topology-data-source.model';
import { EntityEdgeCurveRendererService } from './edge/curved/entity-edge-curve-renderer.service';
import { ApiNodeBoxRendererService } from './node/box/api-node-renderer/api-node-box-renderer.service';
import { BackendNodeBoxRendererService } from './node/box/backend-node-renderer/backend-node-box-renderer.service';
import { ServiceNodeBoxRendererService } from './node/box/service-node-renderer/service-node-box-renderer.service';
import { TopologyEntityTooltipComponent } from './tooltip/topology-entity-tooltip.component';
import { TopologyWidgetModel } from './topology-widget.model';

@Renderer({ modelClass: TopologyWidgetModel })
@Component({
  selector: 'ht-topology-widget-renderer',
  styleUrls: [
    './node/box/entity-node-box-renderer.scss',
    './edge/curved/entity-edge-curve-renderer.scss',
    './topology-widget-renderer.component.scss'
  ],
  providers: [TopologyNodeRendererService, TopologyEdgeRendererService, TopologyTooltipRendererService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topology-container" [ngClass]="{ 'box-style': this.model.enableBoxStyle }">
      <ht-titled-content [title]="this.model.title | htDisplayTitle">
        <div class="visualization" *htLoadAsync="this.data$ as data">
          <div *ngIf="this.model.showLegend" class="legend">
            <div class="latency">
              <div class="label">P99 Latency:</div>
              <div class="entry" *ngFor="let entry of this.getLatencyLegendConfig()">
                <div [ngClass]="entry.categoryClass" class="symbol"></div>
                <span class="label">{{ entry.label }}</span>
              </div>
            </div>
            <div class="error-percentage">
              <div class="label">Errors:</div>
              <div class="entry" *ngFor="let entry of this.getErrorPercentageLegendConfig()">
                <div [ngClass]="entry.categoryClass" class="symbol"></div>
                <span class="label">{{ entry.label }}</span>
              </div>
            </div>
          </div>
          <ht-topology
            class="topology"
            [nodes]="data.nodes"
            [nodeRenderer]="this.nodeRenderer"
            [edgeRenderer]="this.edgeRenderer"
            [tooltipRenderer]="this.tooltipRenderer"
            [nodeDataSpecifiers]="data.nodeSpecs"
            [edgeDataSpecifiers]="data.edgeSpecs"
            [showBrush]="this.model.showBrush"
            [shouldAutoZoomToFit]="this.model.shouldAutoZoomToFit"
          >
          </ht-topology>
        </div>
      </ht-titled-content>
    </div>
  `
})
export class TopologyWidgetRendererComponent extends WidgetRenderer<TopologyWidgetModel, TopologyTemplateData> {
  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TopologyWidgetModel>,
    changeDetector: ChangeDetectorRef,
    public readonly nodeRenderer: TopologyNodeRendererService,
    public readonly edgeRenderer: TopologyEdgeRendererService,
    public readonly tooltipRenderer: TopologyTooltipRendererService,
    private readonly metadataService: MetadataService,
    entityEdgeRenderer: EntityEdgeCurveRendererService,
    serviceNodeRenderer: ServiceNodeBoxRendererService,
    apiNodeRenderer: ApiNodeBoxRendererService,
    backendNodeRenderer: BackendNodeBoxRendererService
  ) {
    super(api, changeDetector);

    nodeRenderer.withDelegate(serviceNodeRenderer).withDelegate(apiNodeRenderer).withDelegate(backendNodeRenderer);
    edgeRenderer.withDelegate(entityEdgeRenderer);
    tooltipRenderer.useTooltip({
      class: TopologyEntityTooltipComponent
    });
  }

  protected fetchData(): Observable<TopologyTemplateData> {
    // Fetch everything into one observable so we only draw the topology once
    return this.model.getData().pipe(
      switchMap(data => {
        if (data.nodes.length === 0) {
          return EMPTY;
        }

        return forkJoinSafeEmpty([of(data), this.buildNodeDataSpecifiers(data), this.buildEdgeDataSpecifiers(data)]);
      }),
      map(([data, nodeSpecs, edgeSpecs]) => ({
        nodes: data.nodes,
        nodeSpecs: nodeSpecs,
        edgeSpecs: edgeSpecs
      }))
    );
  }

  private buildNodeDataSpecifiers(
    data: TopologyData
  ): Observable<TopologyDataSpecifier<MetricAggregationSpecification>[]> {
    data.nodeSpecification.metricSpecifications.map(spec => ({
      label: spec.resultAlias(),
      value: spec
    }));

    return forkJoinSafeEmpty(
      data.nodeSpecification.metricSpecifications.map(spec =>
        // TODO currently sharing specs across all nodes of diff types...
        this.metadataService.getSpecificationDisplayName(data.nodeTypes[0], spec).pipe(
          map(displayName => ({
            label: displayName,
            value: spec
          }))
        )
      )
    );
  }

  private buildEdgeDataSpecifiers(
    data: TopologyData
  ): Observable<TopologyDataSpecifier<MetricAggregationSpecification>[]> {
    return forkJoinSafeEmpty(
      data.edgeSpecification.metricSpecifications.map(spec =>
        this.metadataService.getSpecificationDisplayName(INTERACTION_SCOPE, spec).pipe(
          map(displayName => ({
            label: displayName,
            value: spec
          }))
        )
      )
    );
  }

  public getLatencyLegendConfig(): LatencyLegendConfig[] {
    return [
      {
        categoryClass: PercentileLatencyMetricValueCategory.LessThan20,
        label: 'less than 20ms'
      },
      {
        categoryClass: PercentileLatencyMetricValueCategory.From20To100,
        label: '20-100ms'
      },
      {
        categoryClass: PercentileLatencyMetricValueCategory.From100To500,
        label: '100-500ms'
      },
      {
        categoryClass: PercentileLatencyMetricValueCategory.From500To1000,
        label: '500-1000ms'
      },
      {
        categoryClass: PercentileLatencyMetricValueCategory.GreaterThanOrEqualTo1000,
        label: 'more than 1s'
      }
    ];
  }

  public getErrorPercentageLegendConfig(): ErrorPercentageLegendConfig[] {
    return [
      {
        categoryClass: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5,
        label: '> 5%'
      }
    ];
  }
}

interface TopologyTemplateData {
  nodeSpecs: TopologyDataSpecifier<MetricAggregationSpecification>[];
  edgeSpecs: TopologyDataSpecifier<MetricAggregationSpecification>[];
  nodes: TopologyNode[];
}

interface LatencyLegendConfig {
  categoryClass: string;
  label: string;
}

interface ErrorPercentageLegendConfig {
  categoryClass: string;
  label: string;
}
