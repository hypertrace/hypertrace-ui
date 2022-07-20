import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption } from '@hypertrace/components';
import { combineLatest, EMPTY, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { getAggregationDisplayName, MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { TraceType } from '../../../graphql/model/schema/trace';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { CartesianSeriesVisualizationType } from '../../cartesian/chart';
import { ExploreOrderBy, ExploreSeries, SortByType } from '../explore-visualization-builder';
@Component({
  selector: 'ht-explore-query-order-by-editor',
  styleUrls: ['./explore-query-order-by-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-by-container">
      <span class="order-by-main-label"> Order by </span>
      <div class="fields-container">
        <div class="order-by-input-container" *ngIf="this.metricOptions$ | async as metricOptions">
          <span class="order-by-label"> Metric </span>
          <ht-select
            class="attribute-selector"
            [selected]="this.selectedMetric$ | async"
            [showBorder]="true"
            (selectedChange)="this.onMetricChange($event)"
          >
            <ht-select-option
              *ngFor="let metricOption of metricOptions"
              [value]="metricOption.value"
              [label]="metricOption.label"
            ></ht-select-option>
          </ht-select>
        </div>
        <div class="order-by-input-container" *ngIf="this.aggregationOptions$ | async as aggregationOptions">
          <span class="order-by-label"> Aggregation </span>
          <ht-select
            class="aggregation-selector"
            [selected]="this.selectedAggregation$ | async"
            [showBorder]="true"
            (selectedChange)="this.onAggregationChange($event)"
            [disabled]="aggregationOptions && aggregationOptions.length === 1"
          >
            <ht-select-option
              *ngFor="let aggregationOption of aggregationOptions"
              [value]="aggregationOption.value"
              [label]="aggregationOption.label"
            ></ht-select-option>
          </ht-select>
        </div>
        <div class="order-by-input-container">
          <span class="order-by-label"> Sort by </span>
          <ht-select
            [showBorder]="true"
            [selected]="this.orderByExpression?.sortBy"
            class="order-by-selector"
            (selectedChange)="this.onSortByChange($event)"
          >
            <ht-select-option
              *ngFor="let option of sortByOptions"
              [value]="option.value"
              [label]="option.label"
            ></ht-select-option>
          </ht-select>
        </div>
      </div>
    </div>
  `
})
export class ExploreQueryOrderByEditorComponent implements OnChanges {
  @Input()
  public orderByExpression?: ExploreOrderBy;

  @Input()
  public context?: TraceType;

  @Output()
  public readonly orderByExpressionChange: EventEmitter<ExploreOrderBy | undefined> = new EventEmitter();

  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);
  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();
  public readonly selectedMetric$: Observable<AttributeMetadata | undefined>;
  public readonly aggregationOptions$: Observable<SelectOption<MetricAggregationType>[]>;
  public readonly metricOptions$: Observable<SelectOption<AttributeMetadata>[]>;
  public readonly selectedAggregation$: Observable<MetricAggregationType | undefined>;
  public readonly sortByOptions: SelectOption<SortByType | undefined>[] = [
    {
      value: SortByType.None,
      label: 'None'
    },
    {
      value: SortByType.Asc,
      label: 'Asc'
    },
    {
      value: SortByType.Desc,
      label: 'Desc'
    }
  ];
  // public readonly currentSortByExpression$?: Observable<AttributeExpressionWithMetadata | undefined>;
  private readonly incomingOrderByExpressionSubject: Subject<ExploreOrderBy | undefined> = new ReplaySubject(1);
  // private readonly orderByExpressionsToEmit: Subject<AttributeExpressionWithMetadata | undefined> = new Subject();

  public constructor(private readonly metadataService: MetadataService) {

    this.selectedAggregation$ = combineLatest([this.contextSubject, this.incomingOrderByExpressionSubject]).pipe(
      switchMap(() => this.getCurrentSelectedAggregation())
    );

    // this.selectedVisualizationType$ = this.seriesSubject.pipe(
    //   map(series => series && series.visualizationOptions.type)
    // );

    this.selectedMetric$ = combineLatest([this.contextSubject, this.incomingOrderByExpressionSubject]).pipe(
      switchMap(() => this.getCurrentSelectedAttribute())
    );

    this.aggregationOptions$ = this.selectedMetric$.pipe(
      map(selection => this.getAggregationOptionsForAttribute(selection))
    );

    this.metricOptions$ = this.contextSubject.pipe(
      switchMap(context => this.getAttributeOptionsForContext(context))
    );

    // this.sortBymetricOptions$ = this.contextSubject.pipe(
    //   switchMap(context => this.getSortByOptionsForContext(context))
    // );

    // this.currentSortByExpression$ = combineLatest([
    //   this.sortBymetricOptions$,
    //   merge(this.incomingOrderByExpressionSubject, this.orderByExpressionsToEmit)
    // ]).pipe(map(optionsAndKey => this.resolveAttributeFromOptions(...optionsAndKey)));

    // this.orderByExpressionsToEmit
    // .pipe(
    //   debounceTime(500)
    // )
    // .subscribe(this.orderByExpressionChange);
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }

    if (changeObject.orderByExpression) {
      this.incomingOrderByExpressionSubject.next(this.orderByExpression);
    }
  }

  private getCurrentSelectedAttribute(): Observable<AttributeMetadata | undefined> {
    return this.metricOptions$.pipe(
      map(attributeOptions => attributeOptions.find(option => option.value.name === this.orderByExpression?.metric)),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getCurrentSelectedAggregation(): Observable<MetricAggregationType | undefined> {
    return this.aggregationOptions$.pipe(
      map(aggregationOptions => aggregationOptions.find(option => option.value === this.orderByExpression?.aggregation)),
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

  public onMetricChange(newAttribute: AttributeMetadata): void {
    console.log(newAttribute);
    // this.buildSpecAndEmit(
    //   combineLatest([of(newAttribute), this.selectedAggregation$, this.selectedVisualizationType$])
    // );
  }

  // public onAttributeChange(newAttribute: AttributeMetadata): void {
  //   this.buildSpecAndEmit(
  //     combineLatest([of(newAttribute), this.selectedAggregation$, this.selectedVisualizationType$])
  //   );
  // }

  public buildSpecAndEmit(
    seriesData$: Observable<
      [AttributeMetadata | undefined, MetricAggregationType | undefined, CartesianSeriesVisualizationType | undefined]
    >
  ): void {
    seriesData$
      .pipe(
        take(1),
        switchMap(seriesData => this.buildNewExploreSeries(...seriesData))
      )
      .subscribe(newSeries => {
        console.log(newSeries);
      });
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

  public onAggregationChange(newAggregation: MetricAggregationType): void {
    console.log(newAggregation);
    // this.buildSpecAndEmit(
    //   combineLatest([this.selectedMetric$, of(newAggregation), this.selectedVisualizationType$])
    // );
  }

  // private getSortByOptionsForContext(context?: TraceType): Observable<SelectOption<AttributeMetadata | undefined>[]> {
  //   if (context === undefined) {
  //     return of([this.getEmptySortByOption()]);
  //   }

  //   return this.metadataService.getSortableAttributes(context).pipe(
  //     map(attributes =>
  //       attributes.map(attribute => ({
  //         value: attribute,
  //         label: this.metadataService.getAttributeDisplayName(attribute)
  //       }))
  //     ),
  //     map(attributeOptions => [this.getEmptySortByOption(), ...attributeOptions])
  //   );
  // }

  // private resolveAttributeFromOptions(
  //   options: SelectOption<AttributeMetadata | undefined>[],
  //   expression?: AttributeExpression
  // ): AttributeExpressionWithMetadata | undefined {
  //   if (isNil(expression)) {
  //     return undefined;
  //   }

  //   const metadata = options.find(option => option.value?.name === expression.key)?.value;

  //   return metadata && { ...expression, metadata: metadata };
  // }

  public onSortByChange(newAttribute?: AttributeMetadata): void {
    console.log(newAttribute);
    // this.orderByExpressionsToEmit.next(newAttribute && { key: newAttribute.name, metadata: newAttribute });
  }
}

// interface AttributeExpressionWithMetadata extends AttributeExpression {
//   metadata: AttributeMetadata;
// }
