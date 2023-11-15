import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { findEntityFilterOrThrow } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { NeighborDirection, specificationDefinesNeighbor } from '../../../../../graphql/model/schema/neighbor';
import { Specification } from '../../../../../graphql/model/schema/specifier/specification';
import {
  GraphQlInteractionsRequest,
  InteractionsResponse,
  INTERACTIONS_GQL_REQUEST,
} from '../../../../../graphql/request/handlers/entities/query/interactions/interactions-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model';
import { TableDataSourceModel } from '../table-data-source.model';

@Model({
  type: 'interactions-table-data-source',
})
export class InteractionsTableDataSourceModel extends TableDataSourceModel {
  public getScope(): undefined {
    return;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
  ): GraphQlInteractionsRequest {
    this.assertRequestSupported(request);
    const entityFilter = findEntityFilterOrThrow(filters);
    const neighborType = this.getNeighborType(request);

    return {
      requestType: INTERACTIONS_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      neighborType: neighborType === undefined ? entityFilter.type : neighborType,
      entityId: entityFilter.id,
      entityType: entityFilter.type,
      ...this.getSpecificationPartial(request),
    };
  }

  protected buildTableResponse(response: InteractionsResponse): TableDataResponse<TableRow> {
    return {
      data: response.results,
      totalCount: response.results.length,
    };
  }

  private assertRequestSupported(request: TableDataRequest): void {
    if (request.filters && request.filters.length > 0) {
      throw Error('Interaction data source does not support filtering');
    }
    if (request.position.startIndex > 0) {
      throw Error('Interaction data source does not support paging');
    }
    if (request.sort) {
      throw Error('Interaction data source does not support sorting');
    }
  }

  private getSpecificationPartial(
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
  ): Pick<GraphQlInteractionsRequest, 'interactionSpecifications' | 'neighborSpecifications'> {
    const partial = {
      interactionSpecifications: [] as Specification[],
      neighborSpecifications: [] as Specification[],
    };

    request.columns.forEach(column => {
      if (specificationDefinesNeighbor(column.specification)) {
        partial.neighborSpecifications.push(column.specification);
      } else {
        partial.interactionSpecifications.push(column.specification);
      }
    });

    return partial;
  }

  private getNeighborType(
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
  ): ObservabilityEntityType | undefined {
    return request.columns.reduce<ObservabilityEntityType | undefined>((neighborType, column) => {
      if (!specificationDefinesNeighbor(column.specification)) {
        // Doesn't define neighbor
        return neighborType;
      }
      if (column.specification.neighborDirection !== NeighborDirection.Upstream) {
        // Defines downstream neighbor
        throw Error('Data source only supports upstream neighbors'); // TODO add support in query handler for downstream neighbors
      }
      if (neighborType === undefined) {
        // First discovered upstream neighbor
        return column.specification.neighborType;
      }
      if (neighborType === column.specification.neighborType) {
        // Matches already discovered
        return neighborType;
      }
      // Defines upstream neighbor which doesn't match existing discovered
      throw Error('Data source only supports single neighbor type'); // TODO add support for multiple neighbor types
    }, undefined);
  }
}
