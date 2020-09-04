import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ButtonStyle, SelectOption } from '@hypertrace/components';
import {
  AttributeMetadata,
  getAggregationDisplayName,
  MetadataService,
  MetricAggregationType,
  TraceType
} from '@hypertrace/distributed-tracing';
import { combineLatest, EMPTY, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { CartesianSeriesVisualizationType } from '../../cartesian/chart';
import { ExploreSeries } from '../explore-visualization-builder';

@Component({
  selector: 'ht-explore-query-series-editor',
  styleUrls: ['./explore-query-series-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.series" class="series-group">
      <ht-select-group class="metric-selector">
        <ht-select
          *ngIf="this.attributeOptions$ | async as attributeOptions"
          [selected]="this.selectedAttribute$ | async"
          (selectedChange)="this.onAttributeChange($event)"
          class="attribute-selector"
          [showBorder]="true"
        >
          <ht-select-option
            *ngFor="let option of attributeOptions"
            [value]="option.value"
            [label]="option.label"
          ></ht-select-option>
        </ht-select>

        <ht-select
          *ngIf="this.aggregationOptions$ | async as aggregationOptions"
          [selected]="this.selectedAggregation$ | async"
          (selectedChange)="this.onAggregationChange($event)"
          class="aggregation-selector"
          [disabled]="aggregationOptions && aggregationOptions.length === 1"
          [showBorder]="true"
        >
          <ht-select-option
            *ngFor="let option of aggregationOptions"
            [value]="option.value"
            [label]="option.label"
          ></ht-select-option>
        </ht-select>
      </ht-select-group>

      <div class="visualization-type-selector-container">
        <span class="visualization-type-label">
          Type:
        </span>
        <ht-select
          [selected]="this.selectedVisualizationType$ | async"
          (selectedChange)="this.onVisualizationTypeChange($event)"
          class="visualization-type-selector"
          [showBorder]="true"
        >
          <ht-select-option
            *ngFor="let option of this.visualizationTypeOptions"
            [value]="option.value"
            [label]="option.label"
          ></ht-select-option>
        </ht-select>
      </div>
      <ht-button
        *ngIf="this.removable"
        class="series-remove-button"
        htTooltip="Remove Series"
        icon="${IconType.Close}"
        display="${ButtonStyle.Text}"
        (click)="this.onRemove()"
      ></ht-button>
    </div>
  `
})
export class ExploreQuerySeriesEditorComponent implements OnChanges {
  @Input()
  public removable: boolean = false;

  @Input()
  public context?: TraceType;

  @Input()
  public series?: ExploreSeries;

  @Output()
  public readonly seriesChange: EventEmitter<ExploreSeries> = new EventEmitter();

  @Output()
  public readonly removed: EventEmitter<void> = new EventEmitter();

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);
  private readonly seriesSubject: Subject<ExploreSeries | undefined> = new ReplaySubject(1);

  public readonly selectedAttribute$: Observable<AttributeMetadata | undefined>;
  public readonly attributeOptions$: Observable<SelectOption<AttributeMetadata>[]>;

  public readonly selectedAggregation$: Observable<MetricAggregationType | undefined>;
  public readonly aggregationOptions$: Observable<SelectOption<MetricAggregationType>[]>;

  public readonly selectedVisualizationType$: Observable<CartesianSeriesVisualizationType | undefined>;

  public readonly visualizationTypeOptions: SelectOption<CartesianSeriesVisualizationType>[] = [
    {
      value: CartesianSeriesVisualizationType.Column,
      label: 'Column'
    },
    {
      value: CartesianSeriesVisualizationType.Line,
      label: 'Line'
    },
    {
      value: CartesianSeriesVisualizationType.Area,
      label: 'Area'
    },
    {
      value: CartesianSeriesVisualizationType.Scatter,
      label: 'Scatter'
    }
  ];

  public constructor(private readonly metadataService: MetadataService) {
    this.selectedAggregation$ = this.seriesSubject.pipe(map(series => series && series.specification.aggregation));
    this.selectedVisualizationType$ = this.seriesSubject.pipe(
      map(series => series && series.visualizationOptions.type)
    );

    this.selectedAttribute$ = combineLatest([this.contextSubject, this.seriesSubject]).pipe(
      switchMap(() => this.getCurrentSelectedAttribute())
    );

    this.aggregationOptions$ = this.selectedAttribute$.pipe(
      map(selection => this.getAggregationOptionsForAttribute(selection))
    );

    this.attributeOptions$ = this.contextSubject.pipe(
      switchMap(context => this.getAttributeOptionsForContext(context))
    );
  }

  public onRemove(): void {
    this.removed.next();
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }
    if (changeObject.series) {
      this.seriesSubject.next(this.series);
    }
  }

  public onAggregationChange(newAggregation: MetricAggregationType): void {
    this.buildSpecAndEmit(
      combineLatest([this.selectedAttribute$, of(newAggregation), this.selectedVisualizationType$])
    );
  }

  public onAttributeChange(newAttribute: AttributeMetadata): void {
    this.buildSpecAndEmit(
      combineLatest([of(newAttribute), this.selectedAggregation$, this.selectedVisualizationType$])
    );
  }

  public onVisualizationTypeChange(newVisualizationType: CartesianSeriesVisualizationType): void {
    this.buildSpecAndEmit(
      combineLatest([this.selectedAttribute$, this.selectedAggregation$, of(newVisualizationType)])
    );
  }

  private getCurrentSelectedAttribute(): Observable<AttributeMetadata | undefined> {
    return this.attributeOptions$.pipe(
      map(attributeOptions =>
        attributeOptions.find(option => option.value.name === (this.series && this.series.specification.name))
      ),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getAggregationOptionsForAttribute(selected?: AttributeMetadata): SelectOption<MetricAggregationType>[] {
    if (selected === undefined) {
      return [];
    }

    return selected.allowedAggregations.map(aggType => ({
      value: aggType,
      label: getAggregationDisplayName(aggType)
    }));
  }

  private getAttributeOptionsForContext(context?: TraceType): Observable<SelectOption<AttributeMetadata>[]> {
    if (context === undefined) {
      return of([]);
    }

    return this.metadataService.getSelectionAttributes(context).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          value: attribute,
          label: this.metadataService.getAttributeDisplayName(attribute)
        }))
      )
    );
  }

  private buildSpecAndEmit(
    seriesData$: Observable<
      [AttributeMetadata | undefined, MetricAggregationType | undefined, CartesianSeriesVisualizationType | undefined]
    >
  ): void {
    seriesData$
      .pipe(
        take(1),
        switchMap(seriesData => this.buildNewExploreSeries(...seriesData))
      )
      .subscribe(newSeries => this.seriesChange.next(newSeries));
  }

  private buildNewExploreSeries(
    attribute?: AttributeMetadata,
    aggregation?: MetricAggregationType,
    visualization?: CartesianSeriesVisualizationType
  ): Observable<ExploreSeries> {
    if (!attribute || aggregation === undefined || visualization === undefined) {
      return EMPTY;
    }

    const aggregationToUse = attribute.allowedAggregations.includes(aggregation)
      ? aggregation
      : attribute.allowedAggregations.length > 0
      ? attribute.allowedAggregations[0]
      : undefined;

    return of({
      specification: this.specBuilder.exploreSpecificationForKey(attribute.name, aggregationToUse),
      visualizationOptions: {
        type: visualization
      }
    });
  }
}
