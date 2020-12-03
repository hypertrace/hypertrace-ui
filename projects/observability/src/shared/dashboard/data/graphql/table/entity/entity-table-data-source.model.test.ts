import { fakeAsync, flush } from '@angular/core/testing';
import {
  StatefulTreeTableRow,
  TableDataResponse,
  TableDataSource,
  TableRow,
  TableSortDirection
} from '@hypertrace/components';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { GraphQlTimeRange, SpecificationBackedTableColumnDef } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { mockProvider } from '@ngneat/spectator/jest';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { entityIdKey, entityTypeKey } from './../../../../../graphql/model/schema/entity';
import { ENTITIES_GQL_REQUEST } from './../../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';

import { of } from 'rxjs';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import { EntityTableDataSourceModel } from './entity-table-data-source.model';

describe('Entity table data source model', () => {
  const specBuilder = new ObservabilitySpecificationBuilder();
  let tableDataSource: TableDataSource<TableRow, SpecificationBackedTableColumnDef>;
  let lastEmittedQuery: unknown;
  let spectator!: SpectatorModel<EntityTableDataSourceModel>;

  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            results: [
              {
                [entityIdKey]: 'test-id',
                [entityTypeKey]: ObservabilityEntityType.Service
              }
            ],
            total: 1
          })
        )
      })
    ]
  });

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    spectator = buildModel(EntityTableDataSourceModel);
    spectator.model.api = mockApi as ModelApi;
    spectator.model.entityType = ObservabilityEntityType.Service;
    spectator.model.childEntityDataSource = new EntityTableDataSourceModel();
    spectator.model.childEntityDataSource.api = mockApi as ModelApi;
    spectator.model.childEntityDataSource.entityType = ObservabilityEntityType.Api;
    spectator.model.childEntityDataSource.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));

    spectator.model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
    spectator.model.getData().subscribe(dataSource => (tableDataSource = dataSource));
  });

  test('builds expected request', fakeAsync(() => {
    spectator.model.entityType = ObservabilityEntityType.Service;
    tableDataSource.getData({
      position: {
        startIndex: 0,
        limit: 50
      },
      columns: [
        {
          id: 'Name',
          specification: specBuilder.attributeSpecificationForKey('name')
        },
        {
          id: 'duration',
          specification: specBuilder.attributeSpecificationForKey('duration')
        }
      ],
      sort: {
        column: {
          id: 'Name',
          specification: specBuilder.attributeSpecificationForKey('name')
        },
        direction: TableSortDirection.Descending
      }
    });

    // Query is debounced, flush it out
    flush();
    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: ENTITIES_GQL_REQUEST,
        entityType: 'SERVICE',
        properties: [expect.objectContaining({ name: 'name' }), expect.objectContaining({ name: 'duration' })],
        limit: 100,
        offset: 0,
        sort: {
          direction: TableSortDirection.Descending,
          key: expect.objectContaining({ name: 'name' })
        },
        filters: [],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        includeTotal: true
      })
    );
  }));

  test('builds expected child request', fakeAsync(() => {
    tableDataSource
      .getData({
        position: {
          startIndex: 0,
          limit: 50
        },
        columns: [
          {
            id: 'Name',
            specification: specBuilder.attributeSpecificationForKey('name')
          },
          {
            id: 'duration',
            specification: specBuilder.attributeSpecificationForKey('duration')
          }
        ],
        sort: {
          column: {
            id: 'Name',
            specification: specBuilder.attributeSpecificationForKey('name')
          },
          direction: TableSortDirection.Descending
        }
      })
      .subscribe((response: TableDataResponse<TableRow>) => {
        (response.data[0] as StatefulTreeTableRow).getChildren();
      });

    // Query is debounced, flush it out
    flush();
    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: ENTITIES_GQL_REQUEST,
        entityType: 'API',
        properties: [expect.objectContaining({ name: 'name' }), expect.objectContaining({ name: 'duration' })],
        limit: 40,
        offset: 0,
        sort: {
          direction: TableSortDirection.Descending,
          key: expect.objectContaining({ name: 'name' })
        },
        filters: [{ id: 'test-id', key: 'id', type: 'SERVICE' }],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        includeTotal: true
      })
    );
  }));
});
