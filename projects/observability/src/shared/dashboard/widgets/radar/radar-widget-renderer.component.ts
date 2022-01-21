import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { SelectSize } from '@hypertrace/components';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { isEmpty, uniq } from 'lodash-es';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { RadarAxis, RadarPoint, RadarSeries } from '../../../components/radar/radar';
import { RadarComparisonData, RadarWidgetDataFetcher } from './data/radar-data-source.model';
import { ComparisonDuration, RadarWidgetModel } from './radar-widget.model';

@Renderer({ modelClass: RadarWidgetModel })
@Component({
  selector: 'ht-radar-widget-renderer',
  styleUrls: ['./radar-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content [title]="this.model.title | htDisplayTitle">
      <ht-select
        *htTitledHeaderControl
        [selected]="this.selectedDuration"
        (selectedChange)="this.onSelection($event)"
        size="${SelectSize.Small}"
        class="duration-selector"
      >
        <ht-select-option
          *ngFor="let selectedDuration of this.model.comparisonDurations"
          [value]="selectedDuration"
          [label]="selectedDuration | titlecase"
        ></ht-select-option>
      </ht-select>

      <ng-container *htLoadAsync="this.data$ as data">
        <ht-radar-chart
          [levels]="this.model.levels"
          [axes]="data.axes"
          [series]="data.series"
          [legendPosition]="this.model.legendPosition"
        ></ht-radar-chart>
      </ng-container>
    </ht-titled-content>
  `
})
export class RadarWidgetRendererComponent extends InteractiveDataWidgetRenderer<RadarWidgetModel, RadarOptions> {
  public selectedDuration!: ComparisonDuration;
  private fetcher?: RadarWidgetDataFetcher;

  public constructor(@Inject(RENDERER_API) api: RendererApi<RadarWidgetModel>, changeDetector: ChangeDetectorRef) {
    super(api, changeDetector);
    this.setInitialCategory();
  }

  public onSelection(selectedDuration: ComparisonDuration): void {
    this.selectedDuration = selectedDuration;
    this.updateDataObservable();
  }

  protected fetchData(): Observable<RadarOptions> {
    return this.model.getData().pipe(
      tap(fetcher => (this.fetcher = fetcher)),
      switchMap(() => this.buildDataObservable())
    );
  }

  protected buildDataObservable(): Observable<RadarOptions> {
    return this.fetcher
      ? this.fetcher
          .getData(this.getCompareWithTimeDuration())
          .pipe(map(comparisonedData => this.buildRadarOptions(comparisonedData)))
      : NEVER;
  }

  private buildRadarOptions(comparisonedData: RadarComparisonData): RadarOptions {
    const series = [];
    if (!isEmpty(comparisonedData.previous)) {
      series.push(this.buildComparisonSeries(comparisonedData.previous));
    }

    if (!isEmpty(comparisonedData.current)) {
      series.push(this.buildSeries(comparisonedData.current));
    }

    return {
      axes: this.buildRadarAxes(comparisonedData.current, comparisonedData.previous),
      series: series
    };
  }

  private buildRadarAxes(currentData: RadarPoint[], previousData: RadarPoint[]): RadarAxis[] {
    return uniq(currentData.concat(previousData).map(point => point.axis)).map(axisName => ({ name: axisName }));
  }

  private buildSeries(data: RadarPoint[]): RadarSeries {
    return {
      name: this.model.currentSeries.name,
      data: data,
      color: this.model.currentSeries.color,
      showPoints: true
    };
  }

  private buildComparisonSeries(data: RadarPoint[]): RadarSeries {
    return {
      name: this.selectedDuration.toString(),
      data: data,
      color: '#bfd0d9',
      showPoints: false
    };
  }

  private setInitialCategory(): void {
    this.selectedDuration = this.model.comparisonDurations[0];
  }

  private getCompareWithTimeDuration(): TimeDuration {
    switch (this.selectedDuration) {
      case ComparisonDuration.PriorDay:
        return new TimeDuration(1, TimeUnit.Day);

      case ComparisonDuration.PriorWeek:
        return new TimeDuration(1, TimeUnit.Week);

      case ComparisonDuration.PriorMonth:
        return new TimeDuration(1, TimeUnit.Month);

      case ComparisonDuration.PriorHour:
      default:
        return new TimeDuration(1, TimeUnit.Hour);
    }
  }
}

interface RadarOptions {
  axes: RadarAxis[];
  series: RadarSeries[];
}
