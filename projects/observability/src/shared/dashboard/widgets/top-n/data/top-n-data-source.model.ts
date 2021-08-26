import { TableSortDirection } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { ARRAY_PROPERTY, Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlDataSourceModel } from '@hypertrace/observability';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-query';
import { TopNExploreSelectionSpecificationModel } from './top-n-explore-selection-specification.model';

@Model({
  type: 'top-n-data-source'
})
export class TopNDataSourceModel extends GraphQlDataSourceModel<TopNWidgetDataFetcher> {
  @ModelProperty({
    key: 'entity',
    // tslint:disable-next-line: no-object-literal-type-assertion
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

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      context: metricSpec.context,
      limit: this.resultLimit,
      timeRange: this.getTimeRangeOrThrow(),
      selections: [labelAttributeSpec, idAttributeSpec, metricSpec.metric],
      filters: (filters ?? []).concat(metricSpec.filters ?? []),
      groupBy: {
        keys: [labelAttributeSpec.name, idAttributeSpec.name],
        limit: this.resultLimit
      },
      orderBy: [
        {
          direction: TableSortDirection.Descending,
          key: metricSpec.metric
        }
      ]
    })).pipe(
      map(response =>
        response.results.map(entity => ({
          label: entity[labelAttributeSpec.resultAlias()].value as string,
          value: entity[metricSpec.metric.resultAlias()].value as number,
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
