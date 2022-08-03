import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption } from '@hypertrace/components';
import { combineLatest, EMPTY, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { getAggregationDisplayName, MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { GraphQlSortDirection } from '../../../graphql/model/schema/sort/graphql-sort-direction';
import { TraceType } from '../../../graphql/model/schema/trace';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { GraphQlOrderBy } from '../explore-visualization-builder';
@Component({
  selector: 'ht-explore-query-order-by-editor',
  styleUrls: ['./explore-query-order-by-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-by-container" *ngIf="this.orderByExpression">
      <span class="order-by-main-label"> Order by </span>
      <div class="fields-container">
        <div class="order-by-input-container" *htLoadAsync="this.metricOptions$ as metricOptions">
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
        <div class="order-by-input-container" *htLoadAsync="this.aggregationOptions$ as aggregationOptions">
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
            [selected]="this.selectedSortBy$ | async"
            class="order-by-selector"
            (selectedChange)="this.onSortByChange($event)"
          >
            <ht-select-option
              *ngFor="let option of this.sortByOptions"
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
  public orderByExpression?: GraphQlOrderBy;

  @Input()
  public context?: TraceType;

  @Output()
  public readonly orderByExpressionChange: EventEmitter<GraphQlOrderBy | undefined> = new EventEmitter();

  public readonly selectedMetric$: Observable<AttributeMetadata | undefined>;
  public readonly selectedAggregation$: Observable<MetricAggregationType | undefined>;
  public readonly selectedSortBy$: Observable<GraphQlSortDirection | undefined>;
  public readonly metricOptions$: Observable<SelectOption<AttributeMetadata>[]>;
  public readonly aggregationOptions$: Observable<SelectOption<MetricAggregationType>[]>;
  public readonly sortByOptions: SelectOption<GraphQlSortDirection | undefined>[] = [
    {
      value: undefined,
      label: 'None'
    },
    {
      value: 'ASC',
      label: 'Asc'
    },
    {
      value: 'DESC',
      label: 'Desc'
    }
  ];
  private readonly incomingOrderByExpressionSubject: Subject<GraphQlOrderBy | undefined> = new ReplaySubject(1);
  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);

  public constructor(private readonly metadataService: MetadataService) {
    this.selectedAggregation$ = combineLatest([this.contextSubject, this.incomingOrderByExpressionSubject]).pipe(
      switchMap(() => this.getCurrentSelectedAggregation())
    );

    this.selectedMetric$ = combineLatest([this.contextSubject, this.incomingOrderByExpressionSubject]).pipe(
      switchMap(() => this.getCurrentSelectedAttribute())
    );

    this.selectedSortBy$ = this.incomingOrderByExpressionSubject.pipe(switchMap(() => this.getCurrentSelectedSortBy()));

    this.metricOptions$ = this.contextSubject.pipe(switchMap(context => this.getAttributeOptionsForContext(context)));

    this.aggregationOptions$ = this.selectedMetric$.pipe(
      map(selection => this.getAggregationOptionsForAttribute(selection))
    );
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }

    if (changeObject.orderByExpression) {
      this.incomingOrderByExpressionSubject.next(this.orderByExpression);
    }
  }

  public onMetricChange(newAttribute: AttributeMetadata): void {
    this.buildSpecAndEmit(
      combineLatest([of(newAttribute), this.selectedAggregation$, of(this.orderByExpression?.direction)])
    );
  }

  public onAggregationChange(newAggregation: MetricAggregationType): void {
    this.buildSpecAndEmit(
      combineLatest([this.selectedMetric$, of(newAggregation), of(this.orderByExpression?.direction)])
    );
  }

  public onSortByChange(newSortBy?: GraphQlSortDirection): void {
    this.buildSpecAndEmit(combineLatest([this.selectedMetric$, this.selectedAggregation$, of(newSortBy)]));
  }

  private buildSpecAndEmit(
    orderByData$: Observable<
      [AttributeMetadata | undefined, MetricAggregationType | undefined, GraphQlSortDirection | undefined]
    >
  ): void {
    orderByData$
      .pipe(
        take(1),
        switchMap(orderByData => this.buildOrderExpression(...orderByData))
      )
      .subscribe(value => this.orderByExpressionChange.emit(value));
  }

  private getCurrentSelectedAttribute(): Observable<AttributeMetadata | undefined> {
    return this.metricOptions$.pipe(
      map(attributeOptions =>
        attributeOptions.find(option => option.value.name === this.orderByExpression?.keyExpression?.key)
      ),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getCurrentSelectedAggregation(): Observable<MetricAggregationType | undefined> {
    return this.aggregationOptions$.pipe(
      map(aggregationOptions =>
        aggregationOptions.find(option => option.value === this.orderByExpression?.aggregation)
      ),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getCurrentSelectedSortBy(): Observable<GraphQlSortDirection | undefined> {
    return of(this.sortByOptions.find(option => option.value === this.orderByExpression?.direction)?.value)
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

  private buildOrderExpression(
    attribute?: AttributeMetadata,
    aggregation?: MetricAggregationType,
    sortBy?: GraphQlSortDirection
  ): Observable<GraphQlOrderBy> {
    if (attribute === undefined || aggregation === undefined) {
      return EMPTY;
    }

    const aggregationToUse = attribute.allowedAggregations.includes(aggregation)
      ? aggregation
      : attribute.allowedAggregations.length > 0
      ? attribute.allowedAggregations[0]
      : undefined;

    return of({
      aggregation: aggregationToUse,
      direction: sortBy,
      keyExpression: {
        key: attribute.name
      }
    });
  }
}
