import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption } from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { combineLatest, EMPTY, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { AttributeExpression } from '../../../graphql/model/attribute/attribute-expression';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { getAggregationDisplayName, MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { TraceType } from '../../../graphql/model/schema/trace';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { CartesianSeriesVisualizationType } from '../../cartesian/chart';
import { ExploreSeries } from '../explore-visualization-builder';
@Component({
  selector: 'ht-explore-query-order-by-editor',
  styleUrls: ['./explore-query-order-by-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-by-container" *htLetAsync="this.currentSortByExpression$ as currentSortByExpression">
      <span class="order-by-main-label"> Order by </span>
      <div class="fields-container">
        <div class="order-by-input-container" *ngIf="this.attributeOptions$ | async as attributeOptions">
          <span class="order-by-label"> Metric </span>
          <ht-select
            class="attribute-selector"
            [selected]="this.selectedAttribute$ | async"
            [showBorder]="true"
            (selectedChange)="this.onAttributeChange($event)"
          >
            <ht-select-option
              *ngFor="let option of attributeOptions"
              [value]="option.value"
              [label]="option.label"
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
              *ngFor="let option of aggregationOptions"
              [value]="option.value"
              [label]="option.label"
            ></ht-select-option>
          </ht-select>
        </div>
        <div class="order-by-input-container">
          <span class="order-by-label"> Sort by </span>
          <ht-select
            *ngIf="this.sortByAttributeOptions$ | async as sortByOptions"
            [showBorder]="true"
            class="order-by-selector"
            [selected]="currentSortByExpression && currentSortByExpression.metadata"
            (selectedChange)="this.onSortByAttributeChange($event)"
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
  public orderByExpression?: AttributeExpression;

  @Input()
  public context?: TraceType;

  @Input()
  public series?: ExploreSeries;

  @Output()
  public readonly orderByExpressionChange: EventEmitter<AttributeExpression | undefined> = new EventEmitter();

  @Output()
  public readonly seriesChange: EventEmitter<ExploreSeries> = new EventEmitter();

  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);

  // TODO: Used here
  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();
  private readonly seriesSubject: Subject<ExploreSeries | undefined> = new ReplaySubject(1);
  public readonly selectedAttribute$: Observable<AttributeMetadata | undefined>;
  public readonly aggregationOptions$: Observable<SelectOption<MetricAggregationType>[]>;
  public readonly attributeOptions$: Observable<SelectOption<AttributeMetadata>[]>;
  public readonly selectedAggregation$: Observable<MetricAggregationType | undefined>;
  public readonly selectedVisualizationType$: Observable<CartesianSeriesVisualizationType | undefined>;
  public readonly sortByAttributeOptions$: Observable<SelectOption<AttributeMetadata | undefined>[]>;
  public readonly currentSortByExpression$: Observable<AttributeExpressionWithMetadata | undefined>;
  private readonly incomingSortByExpressionSubject: Subject<AttributeExpression | undefined> = new ReplaySubject(1);
  private readonly sortByExpressionsToEmit: Subject<AttributeExpressionWithMetadata | undefined> = new Subject();
  

  public constructor(private readonly metadataService: MetadataService) {

    this.sortByExpressionsToEmit
      .pipe(
        debounceTime(500)
      )
      .subscribe(this.orderByExpressionChange);


      // Todo: new one
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

      this.sortByAttributeOptions$ = this.contextSubject.pipe(
        switchMap(context => this.getSortByOptionsForContext(context))
      );

      this.currentSortByExpression$ = combineLatest([
        this.sortByAttributeOptions$,
        merge(this.incomingSortByExpressionSubject, this.sortByExpressionsToEmit)
      ]).pipe(map(optionsAndKey => this.resolveAttributeFromOptions(...optionsAndKey)));
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }

    if (changeObject.orderByExpression) {
      this.incomingSortByExpressionSubject.next(this.orderByExpression);
    }

    if (changeObject.series) {
      this.seriesSubject.next(this.series);
    }
  }

  // Todo: new one

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

  public onAttributeChange(newAttribute: AttributeMetadata): void {
    this.buildSpecAndEmit(
      combineLatest([of(newAttribute), this.selectedAggregation$, this.selectedVisualizationType$])
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

  public onAggregationChange(newAggregation: MetricAggregationType): void {
    this.buildSpecAndEmit(
      combineLatest([this.selectedAttribute$, of(newAggregation), this.selectedVisualizationType$])
    );
  }

  private getSortByOptionsForContext(context?: TraceType): Observable<SelectOption<AttributeMetadata | undefined>[]> {
    if (context === undefined) {
      return of([this.getEmptySortByOption()]);
    }

    return this.metadataService.getSortableAttributes(context).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          value: attribute,
          label: this.metadataService.getAttributeDisplayName(attribute)
        }))
      ),
      map(attributeOptions => [this.getEmptySortByOption(), ...attributeOptions])
    );
  }

  private getEmptySortByOption(): SelectOption<AttributeMetadata | undefined> {
    return {
      value: undefined,
      label: 'None'
    };
  }

  private resolveAttributeFromOptions(
    options: SelectOption<AttributeMetadata | undefined>[],
    expression?: AttributeExpression
  ): AttributeExpressionWithMetadata | undefined {
    if (isNil(expression)) {
      return undefined;
    }

    const metadata = options.find(option => option.value?.name === expression.key)?.value;

    return metadata && { ...expression, metadata: metadata };
  }

  public onSortByAttributeChange(newAttribute?: AttributeMetadata): void {
    this.sortByExpressionsToEmit.next(newAttribute && { key: newAttribute.name, metadata: newAttribute });
  }
}

interface AttributeExpressionWithMetadata extends AttributeExpression {
  metadata: AttributeMetadata;
}
