import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { HeuristicScoreInfo } from '../service-instrumentation.types';

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
        <a title="Open in Explorer" [href]="this.getExampleLink(exampleId)">{{ exampleId }}</a>
        <span *ngIf="i < this.heuristicScore?.sampleIds.length - 1">, </span>
      </span>
    </p>
    <p class="metric"><b>Evaluated on:</b> {{ this.getEvaluationDate() }}</p>
  `
})
export class PanelContentComponent {
  @Input()
  public heuristicScore: HeuristicScoreInfo | undefined;

  public getExampleLink(id: string): string {
    if (this.heuristicScore?.sampleType === 'span') {
      return `/explorer?time=1d&scope=spans&series=column:count(spans)&filter=id_eq_${id}`;
    }

    return `/explorer?time=1d&scope=endpoint-traces&series=column:count(calls)&filter=traceId_eq_${id}`;
  }

  public getEvaluationDate(): string {
    const [day, month, date, year] = new Date(Number(this.heuristicScore?.evalTimestamp) * 1000)
      .toDateString()
      .split(' ');

    return `${day}, ${date} ${month} ${year}`;
  }
}
