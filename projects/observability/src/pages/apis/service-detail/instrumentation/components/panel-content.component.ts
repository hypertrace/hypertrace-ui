import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BreadcrumbsService } from '@hypertrace/components';
import {
  HeuristicScoreInfo,
  SampleHeuristicEnityId,
  SAMPLE_HEURISTIC_ENTITY_DELIMETER
} from '../service-instrumentation.types';

@Component({
  styleUrls: ['./panel-content.component.scss'],
  selector: 'ht-service-instrumentation-panel-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="description">{{ this.heuristicScore?.description }}</p>
    <p class="metric"><b>Sample size:</b> {{ this.heuristicScore?.sampleSize }}</p>
    <p class="metric"><b>Failures:</b> {{ this.heuristicScore?.failureCount }}</p>
    <p class="metric" *ngIf="this.heuristicScore?.sampleIds.length > 0">
      <b>Example {{ this.heuristicScore?.sampleType }}s: </b>
      <span *ngFor="let exampleId of this.heuristicScore?.sampleIds; let i = index">
        <a target="_blank" title="Open in Explorer" [href]="this.getExampleLink(exampleId)">{{
          this.getExampleHeuristicEntityId(exampleId)
        }}</a>
        <span *ngIf="i < this.heuristicScore?.sampleIds.length - 1">, </span>
      </span>
    </p>
    <p class="metric"><b>Evaluated on:</b> {{ this.getEvaluationDate() }}</p>
  `
})
export class PanelContentComponent {
  @Input()
  public heuristicScore: HeuristicScoreInfo | undefined;

  private serviceName: string = '';
  private readonly timeDuration: string = '12h';
  private readonly SAMPLE_DELIMETER: SAMPLE_HEURISTIC_ENTITY_DELIMETER = ':';

  public constructor(private readonly breadcrumbsService: BreadcrumbsService) {
    this.breadcrumbsService.getLastBreadCrumbString().subscribe(serviceName => (this.serviceName = serviceName));
  }

  public getExampleHeuristicEntityId(sampleId: SampleHeuristicEnityId<SAMPLE_HEURISTIC_ENTITY_DELIMETER>): string {
    const [entityId] = sampleId.split(this.SAMPLE_DELIMETER);

    return entityId ?? '';
  }

  public getExampleLink(id: SampleHeuristicEnityId<SAMPLE_HEURISTIC_ENTITY_DELIMETER>): string {
    const [heuristicEntityId, heuristicEntityStartTime] = id.split(this.SAMPLE_DELIMETER);
    const exampleGeneratedUrl =
      this.heuristicScore?.sampleType === 'span'
        ? `/explorer?time=${this.timeDuration}&scope=spans&series=column:count(spans)`
        : `/explorer?time=${this.timeDuration}&scope=endpoint-traces&series=column:count(calls)`;

    const explorerFiltersToApply = [
      { key: 'serviceName', value: this.serviceName, operator: 'eq' },
      { key: 'startTime', value: heuristicEntityStartTime, operator: 'eq' },
      { key: 'id', value: heuristicEntityId, operator: 'eq', scope: 'span' },
      { key: 'traceId', value: heuristicEntityId, operator: 'eq', scope: 'trace' }
    ];

    return explorerFiltersToApply
      .filter(
        explorerFilter => explorerFilter.scope === undefined || explorerFilter.scope === this.heuristicScore?.sampleType
      )
      .reduce(
        (previousValue, currValue) =>
          `${previousValue}&filter=${currValue.key}_${currValue.operator}_${currValue.value}`,
        exampleGeneratedUrl
      );
  }

  public getEvaluationDate(): string {
    const [day, month, date, year] = new Date(Number(this.heuristicScore?.evalTimestamp) * 1000)
      .toDateString()
      .split(' ');

    return `${day}, ${date} ${month} ${year}`;
  }
}
