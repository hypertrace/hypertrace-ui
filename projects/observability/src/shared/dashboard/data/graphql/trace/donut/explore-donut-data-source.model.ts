import {
  Model,
  ModelProperty,
  NUMBER_PROPERTY,
  PLAIN_OBJECT_PROPERTY,
  STRING_PROPERTY,
  UNKNOWN_PROPERTY
} from '@hypertrace/hyperdash';
import { isEmpty } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DonutSeries, DonutSeriesResults } from '../../../../../components/donut/donut';
import { AttributeExpression } from '../../../../../graphql/model/attribute/attribute-expression';
import { GraphQlSortBySpecification } from '../../../../../graphql/model/schema/sort/graphql-sort-by-specification';
import { ExploreSpecification } from '../../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from '../../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../../graphql/request/handlers/explore/explore-query';
import { ExploreResult } from '../../explore/explore-result';
import { GraphQlDataSourceModel } from '../../graphql-data-source.model';
import { ExploreSelectionSpecificationModel } from '../../specifiers/explore-selection-specification.model';

@Model({
  type: 'explore-donut-data-source'
})
export class ExploreDonutDataSourceModel extends GraphQlDataSourceModel<DonutSeriesResults> {
  @ModelProperty({
    key: 'context',
    required: true,
    type: STRING_PROPERTY.type
  })
  public context!: string;

  @ModelProperty({
    key: 'group-by',
    required: true,
    type: UNKNOWN_PROPERTY.type
  })
  public groupBy: AttributeExpression[] = [];

  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: UNKNOWN_PROPERTY.type,
    required: true
  })
  public metric!: ExploreSelectionSpecificationModel;

  @ModelProperty({
    key: 'maxResults',
    type: NUMBER_PROPERTY.type
  })
  @ModelProperty({
    key: 'order-by',
    required: false,
    type: PLAIN_OBJECT_PROPERTY.type
  })
  public orderBy?: GraphQlSortBySpecification;

  public maxResults: number = 5;

  private _groupBy: AttributeExpression[] = [];

  public getData(): Observable<DonutSeriesResults> {
    const metric: AttributeExpression =
      typeof this.metric.metric === 'string'
        ? { key: this.metric.metric }
        : { key: this.metric.metric.key, subpath: this.metric.metric.subpath };
    this._groupBy = this.groupBy.map(attributeExpression => ({
      key: attributeExpression.key,
      ...(!isEmpty(attributeExpression.subpath) ? { subpath: attributeExpression.subpath } : {})
    }));

    return this.query<ExploreGraphQlQueryHandlerService>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      selections: [
        new ExploreSpecificationBuilder().exploreSpecificationForAttributeExpression(metric, this.metric.aggregation)
      ],
      context: this.context,
      limit: this.maxResults,
      timeRange: this.getTimeRangeOrThrow(),
      filters: filters,
      orderBy:
        this.orderBy && this.orderBy.key
          ? [
              {
                direction: this.orderBy.direction,
                key: this.orderBy.key
              }
            ]
          : [],
      groupBy: {
        keyExpressions: this._groupBy,
        limit: this.maxResults
      }
    })).pipe(map(exploreResponse => this.buildDonutResults(exploreResponse, this.metric)));
  }

  private buildDonutResults(exploreResponse: GraphQlExploreResponse, metric: ExploreSpecification): DonutSeriesResults {
    let total = 0;

    const series: DonutSeries[] = new ExploreResult(exploreResponse)
      .getGroupedSeriesData([...this._groupBy], metric.name, metric.aggregation!)
      .map(seriesTuple => {
        total = total + seriesTuple.value;

        return {
          name: seriesTuple.keys.join(', '),
          value: seriesTuple.value
        };
      });

    return {
      series: series,
      total: total
    };
  }
}
