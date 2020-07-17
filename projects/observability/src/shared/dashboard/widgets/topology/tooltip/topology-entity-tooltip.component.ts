import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Dictionary, forkJoinSafeEmpty } from '@hypertrace/common';
import { IconSize, PopoverRef, POPOVER_DATA } from '@hypertrace/components';
import { MetadataService, MetricAggregation } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  TopologyTooltipData,
  TopologyTooltipEdgeData,
  TopologyTooltipNodeData
} from '../../../../components/topology/renderers/tooltip/topology-tooltip-renderer.service';
import { entityTypeKey, INTERACTION_SCOPE } from '../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import {
  EntityEdge,
  EntityNode
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';

@Component({
  selector: 'ht-topology-entity-tooltip',
  styleUrls: ['./topology-entity-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tooltip-container" *ngIf="this.data$ | async as data">
      <h3 class="tooltip-title">
        <span *ngIf="data.title.type === 'node'; else edgeTitle" class="title-text">
          {{ data.title.value }}
        </span>
        <ng-template #edgeTitle>
          <span class="title-text">{{ data.title.from }}</span>
          <htc-icon icon="${IconType.ArrowUp}" size="${IconSize.Small}" class="edge-title-arrow"></htc-icon>
          <span class="title-text">{{ data.title.to }}</span>
        </ng-template>
        <div class="hide-tooltip-button-container" *ngIf="data.showHideButton">
          <htc-icon
            icon="${IconType.Cancel}"
            size="${IconSize.Small}"
            class="hide-tooltip-button"
            (click)="this.onHide()"
          ></htc-icon>
        </div>
      </h3>
      <hr class="tooltip-divider" />
      <div>
        <div *ngFor="let metric of data.metrics">
          <div class="metric-row">
            <div class="metric-label">
              {{ metric.label | titlecase }}
            </div>
            <div class="metric-value">{{ metric.value | htcDisplayNumber }}</div>
            <div class="metric-unit" *ngIf="metric.units">{{ metric.units }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopologyEntityTooltipComponent {
  public readonly data$: Observable<TooltipTemplateData>;
  public constructor(
    @Inject(POPOVER_DATA) dataStream: Observable<TopologyTooltipData>,
    private readonly metadataService: MetadataService,
    private readonly popoverRef: PopoverRef
  ) {
    this.data$ = dataStream.pipe(switchMap(tooltipData => this.convertTooltipDataToTemplateData(tooltipData)));
  }

  public onHide(): void {
    this.popoverRef.hide();
  }

  private convertTooltipDataToTemplateData(tooltipData: TopologyTooltipData): Observable<TooltipTemplateData> {
    if (tooltipData.type === 'node') {
      return this.convertNodeToTemplateData(tooltipData);
    }

    return this.convertEdgeToTemplateData(tooltipData);
  }

  private convertNodeToTemplateData(nodeData: TopologyTooltipNodeData): Observable<TooltipTemplateData> {
    const node = nodeData.node as EntityNode;

    return this.getMetrics(node.data, node.specification.metricSpecifications, node.data[entityTypeKey]).pipe(
      map(metrics => ({
        title: {
          type: 'node',
          value: this.getTitleForNode(node)
        },
        metrics: metrics,
        showHideButton: !!nodeData.options.modal
      }))
    );
  }

  private convertEdgeToTemplateData(edgeData: TopologyTooltipEdgeData): Observable<TooltipTemplateData> {
    const edge = edgeData.edge as EntityEdge;

    return this.getMetrics(edge.data, edge.specification.metricSpecifications, INTERACTION_SCOPE).pipe(
      map(metrics => ({
        title: {
          type: 'edge',
          from: this.getTitleForNode(edge.fromNode),
          to: this.getTitleForNode(edge.toNode)
        },
        metrics: metrics,
        showHideButton: !!edgeData.options.modal
      }))
    );
  }

  private getTitleForNode(node: EntityNode): string {
    return node.data[node.specification.titleSpecification.resultAlias()] as string;
  }

  private getMetrics(
    dataContainer: Dictionary<unknown>,
    metricSpecs: MetricAggregationSpecification[],
    scope: string
  ): Observable<TooltipMetricRow[]> {
    return forkJoinSafeEmpty(
      metricSpecs.map(spec =>
        this.metadataService.getSpecificationDisplayNameWithUnit(scope, spec).pipe(
          map(metricDetailFromSpec => {
            const metric = dataContainer[spec.resultAlias()] as MetricAggregation;

            return {
              label: metricDetailFromSpec.name,
              value: metric.value,
              units: metric.units ?? metricDetailFromSpec.units
            };
          })
        )
      )
    );
  }
}

interface TooltipTemplateData {
  title:
    | {
        type: 'node';
        value: string;
      }
    | {
        type: 'edge';
        from: string;
        to: string;
      };
  metrics: TooltipMetricRow[];
  showHideButton: boolean;
}

interface TooltipMetricRow {
  label: string;
  value: number;
  units?: string;
}
