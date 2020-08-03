import { GraphQlDataSourceModel } from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, NUMBER_PROPERTY, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExploreRequestContext } from '../../../../components/explore-query-editor/explore-visualization-builder';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse,
  GraphQlExploreResultValue
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

@Model({
  type: 'top-n-data-source'
})
export class TopNDataSourceModel extends GraphQlDataSourceModel<TopNWidgetDataFetcher> {
  @ModelProperty({
    key: 'context',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: STRING_PROPERTY.type
  })
  public context!: ExploreRequestContext;

  @ModelProperty({
    key: 'result-limit',
    displayName: 'Result Limit',
    type: NUMBER_PROPERTY.type
  })
  public resultLimit: number = 10;

  public getData(): Observable<TopNWidgetDataFetcher> {
    return of({
      scope: this.context,
      getData: (metricSpecification: ExploreSpecification) => this.fetchDataWithMetric(metricSpecification)
    });
  }

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  private readonly nameAttributeSpec: ExploreSpecification = this.specBuilder.exploreSpecificationForKey('name');
  private readonly idAttributeSpec: ExploreSpecification = this.specBuilder.exploreSpecificationForKey('id');

  private fetchDataWithMetric(metricSpecification: ExploreSpecification): Observable<TopNWidgetValueData[]> {
    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      limit: this.resultLimit,
      timeRange: this.getTimeRangeOrThrow(),
      selections: [this.nameAttributeSpec, this.idAttributeSpec, metricSpecification],
      filters: filters,
      groupBy: {
        keys: [this.nameAttributeSpec.name, this.idAttributeSpec.name]
      },
      orderBy: [
        {
          direction: 'DESC',
          key: metricSpecification
        }
      ]
    })).pipe(
      map(response =>
        response.results.map(entity => ({
          label: entity[this.nameAttributeSpec.resultAlias()].value as string,
          value: entity[metricSpecification.resultAlias()].value as number,
          entity: {
            [entityIdKey]: entity[this.idAttributeSpec.resultAlias()].value as string,
            [entityTypeKey]: this.getEntityTypeForContext(this.context)
          }
        }))
      )
    );
  }

  private getEntityTypeForContext(context: string): string {
    switch (context) {
      case 'API':
        return ObservabilityEntityType.Api;
      case 'SERVICE':
        return ObservabilityEntityType.Service;
      default:
        return '';
    }
  }
}

export interface TopNWidgetDataFetcher {
  scope: string;
  getData(metricSpecification: ExploreSpecification): Observable<TopNWidgetValueData[]>;
}

export interface TopNWidgetValueData {
  label: string;
  value: number;
  entity: Entity;
}
