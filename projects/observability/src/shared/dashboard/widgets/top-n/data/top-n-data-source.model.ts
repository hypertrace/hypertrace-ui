import { TableSortDirection } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlDataSourceModel } from '@hypertrace/distributed-tracing';
import { ARRAY_PROPERTY, Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { TopNExploreSelectionSpecificationModel } from './top-n-explore-selection-specification.model';

@Model({
  type: 'top-n-data-source'
})
export class TopNDataSourceModel extends GraphQlDataSourceModel<TopNWidgetDataFetcher> {
  @ModelProperty({
    key: 'entity',
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public entityType!: string;

  @ModelProperty({
    key: 'result-limit',
    displayName: 'Result Limit',
    type: NUMBER_PROPERTY.type
  })
  public resultLimit: number = 10;

  @ModelProperty({
    type: ARRAY_PROPERTY.type,
    key: 'options',
    required: true
  })
  public options!: TopNExploreSelectionSpecificationModel[];

  public getData(): Observable<TopNWidgetDataFetcher> {
    return of({
      getData: (metricSpecification: TopNExploreSelectionSpecificationModel) =>
        this.fetchDataWithMetric(metricSpecification),
      getOptions: () => this.options
    });
  }

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  private fetchDataWithMetric(metricSpec: TopNExploreSelectionSpecificationModel): Observable<TopNWidgetValueData[]> {
    const labelAttributeSpec: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(metricSpec.nameKey);
    const idAttributeSpec: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(metricSpec.idKey);

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      context: metricSpec.context,
      limit: this.resultLimit,
      timeRange: this.getTimeRangeOrThrow(),
      selections: [labelAttributeSpec, idAttributeSpec, metricSpec.exploreSpec],
      filters: (filters ?? []).concat(metricSpec.filters ?? []),
      groupBy: {
        keys: [labelAttributeSpec.name, idAttributeSpec.name]
      },
      orderBy: [
        {
          direction: TableSortDirection.Descending,
          key: metricSpec.exploreSpec
        }
      ]
    })).pipe(
      map(response =>
        response.results.map(entity => ({
          label: entity[labelAttributeSpec.resultAlias()].value as string,
          value: entity[metricSpec.exploreSpec.resultAlias()].value as number,
          entity: {
            [entityIdKey]: entity[idAttributeSpec.resultAlias()].value as string,
            [entityTypeKey]: this.entityType
          }
        }))
      )
    );
  }
}

export interface TopNWidgetDataFetcher {
  getOptions(): TopNExploreSelectionSpecificationModel[];
  getData(metricSpecification: TopNExploreSelectionSpecificationModel): Observable<TopNWidgetValueData[]>;
}

export interface TopNWidgetValueData {
  label: string;
  value: number;
  entity: Entity;
}
