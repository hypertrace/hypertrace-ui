import { GraphQlDataSourceModel, MetricAggregation, MetricHealth } from '@hypertrace/distributed-tracing';
import {
  Model,
  ModelProperty,
  ModelPropertyType,
  ModelPropertyTypeInstance,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreSelectionSpecificationModel } from '../specifiers/explore-selection-specification.model';

@Model({
  type: 'metric-aggregation-data-source'
})
export class MetricAggregationDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: ExploreSelectionSpecificationModel
    } as ModelPropertyTypeInstance,
    required: true
  })
  public metric!: ExploreSelectionSpecificationModel;

  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type,
    required: true
  })
  public context!: string;

  public getData(): Observable<MetricAggregation> {
    const spec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
      this.metric.metric,
      this.metric.aggregation
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      context: this.context,
      limit: 1,
      selections: [spec],
      filters: this.filters
    }).pipe(
      map(result => ({
        value: result.results[0][spec.resultAlias()].value as number,
        health: MetricHealth.NotSpecified,
        units: '' // TODO: pipe in units to result.units in explore-graphql-query-handler.service.ts
      }))
    );
  }
}
