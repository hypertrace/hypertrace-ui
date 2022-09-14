import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption } from '@hypertrace/components';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
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
    <div class="order-by-container">
      <span class="order-by-main-label"> Order by </span>
      <div class="fields-container">
        <div class="order-by-input-container">
          <span class="order-by-label"> Metric </span>
          <ht-select
            class="attribute-selector"
            [selected]="this.selectedMetric$ | async"
            [showBorder]="true"
            (selectedChange)="this.onMetricChange($event)"
            [disabled]="(this.metricOptions$ | async)?.length <= 1"
          >
            <ht-select-option
              *ngFor="let metricOption of this.metricOptions$ | async"
              [value]="metricOption.value"
              [label]="metricOption.label"
            ></ht-select-option>
          </ht-select>
        </div>
        <div class="order-by-input-container">
          <span class="order-by-label"> Aggregation </span>
          <ht-select
            class="aggregation-selector"
            [selected]="this.selectedAggregation$ | async"
            [showBorder]="true"
            (selectedChange)="this.onAggregationChange($event)"
            [disabled]="(this.aggregationOptions$ | async)?.length <= 1"
          >
            <ht-select-option
              *ngFor="let aggregationOption of this.aggregationOptions$ | async"
              [value]="aggregationOption.value"
              [label]="aggregationOption.label"
            ></ht-select-option>
          </ht-select>
        </div>
        <div class="order-by-input-container">
          <span class="order-by-label"> Direction </span>
          <ht-select
            [showBorder]="true"
            [selected]="this.selectedSortBy$ | async"
            class="order-by-selector"
            (selectedChange)="this.onSortByChange($event)"
            [disabled]="!(this.selectedMetric$ | async)"
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
  public readonly selectedAggregation$: Observable<MetricAggregationType>;
  public readonly selectedSortBy$: Observable<GraphQlSortDirection>;
  public readonly metricOptions$: Observable<SelectOption<AttributeMetadata | undefined>[]>;
  public readonly aggregationOptions$: Observable<SelectOption<MetricAggregationType>[]>;
  public readonly sortByOptions: SelectOption<GraphQlSortDirection>[] = [
    {
      value: SortDirection.Asc,
      label: 'Asc'
    },
    {
      value: SortDirection.Desc,
      label: 'Desc'
    }
  ];
  private readonly defaultDirection = SortDirection.Asc;
  private readonly incomingOrderByExpressionSubject: Subject<GraphQlOrderBy> = new ReplaySubject(1);
  private readonly contextSubject: Subject<TraceType> = new ReplaySubject(1);

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
      combineLatest([
        of(newAttribute),
        this.selectedAggregation$,
        of(this.orderByExpression?.direction ?? this.defaultDirection)
      ])
    );
  }

  public onAggregationChange(newAggregation: MetricAggregationType): void {
    this.buildSpecAndEmit(
      combineLatest([this.selectedMetric$, of(newAggregation), of(this.orderByExpression!.direction)])
    );
  }

  public onSortByChange(newSortBy: GraphQlSortDirection): void {
    this.buildSpecAndEmit(combineLatest([this.selectedMetric$, this.selectedAggregation$, of(newSortBy)]));
  }

  private buildSpecAndEmit(
    orderByData$: Observable<[AttributeMetadata | undefined, MetricAggregationType, GraphQlSortDirection]>
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
        attributeOptions.find(option => option.value?.name === this.orderByExpression?.keyExpression?.key)
      ),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getCurrentSelectedAggregation(): Observable<MetricAggregationType> {
    return this.aggregationOptions$.pipe(
      map(
        aggregationOptions => aggregationOptions.find(option => option.value === this.orderByExpression?.aggregation)!
      ),
      map(matchedSelection => matchedSelection && matchedSelection.value)
    );
  }

  private getCurrentSelectedSortBy(): Observable<GraphQlSortDirection> {
    return of(
      this.sortByOptions.find(option => this.orderByExpression && option.value === this.orderByExpression.direction)
        ?.value ?? this.defaultDirection
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

  private getAttributeOptionsForContext(
    context?: TraceType
  ): Observable<SelectOption<AttributeMetadata | undefined>[]> {
    if (context === undefined) {
      return of([]);
    }

    return this.metadataService.getSelectionAttributes(context).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          value: attribute,
          label: this.metadataService.getAttributeDisplayName(attribute)
        }))
      ),
      map(attributeOptions => [this.getEmptyAttributeOption(), ...attributeOptions])
    );
  }

  private getEmptyAttributeOption(): SelectOption<AttributeMetadata | undefined> {
    return {
      value: undefined,
      label: 'None'
    };
  }

  private buildOrderExpression(
    attribute: AttributeMetadata | undefined,
    aggregation: MetricAggregationType,
    sortBy: GraphQlSortDirection
  ): Observable<GraphQlOrderBy | undefined> {
    if (attribute === undefined) {
      return of(attribute);
    }

    return of({
      aggregation: attribute.allowedAggregations.includes(aggregation) ? aggregation : attribute.allowedAggregations[0],
      direction: sortBy,
      keyExpression: {
        key: attribute.name
      }
    });
  }
}

export const enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}
