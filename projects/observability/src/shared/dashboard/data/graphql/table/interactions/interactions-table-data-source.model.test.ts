import { fakeAsync, flush } from '@angular/core/testing';
import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { TableDataSource, TableRow } from '@hypertrace/components';
import { ModelApi } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { NeighborDirection } from '../../../../../graphql/model/schema/neighbor';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import { INTERACTIONS_GQL_REQUEST } from '../../../../../graphql/request/handlers/entities/query/interactions/interactions-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model';
import { InteractionsTableDataSourceModel } from './interactions-table-data-source.model';

describe('Interactions table data source model', () => {
  const specBuilder = new ObservabilitySpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  const testEntityFilter = new GraphQlEntityFilter('test', ObservabilityEntityType.Backend);
  let model!: InteractionsTableDataSourceModel;
  let tableDataSource: TableDataSource<TableRow, SpecificationBackedTableColumnDef>;
  let lastEmittedQuery: unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new InteractionsTableDataSourceModel();
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([testEntityFilter])));
    model.getData().subscribe(dataSource => (tableDataSource = dataSource));
  });

  test('builds expected request', fakeAsync(() => {
    tableDataSource.getData({
      position: {
        startIndex: 0,
        limit: 50
      },
      columns: [
        {
          id: 'avg latency',
          specification: specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)
        },
        {
          id: 'service name',
          specification: specBuilder.neighborAttributeSpecificationForKey(
            'name',
            ObservabilityEntityType.Service,
            NeighborDirection.Upstream
          )
        }
      ]
    });
    // Query is debounced, flush it out
    flush();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: INTERACTIONS_GQL_REQUEST,
        interactionSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        entityType: ObservabilityEntityType.Backend,
        entityId: 'test',
        neighborType: ObservabilityEntityType.Service,
        neighborSpecifications: [
          specBuilder.neighborAttributeSpecificationForKey(
            'name',
            ObservabilityEntityType.Service,
            NeighborDirection.Upstream
          )
        ]
      })
    ).toBe(true);
  }));
});
