import { fakeAsync, flush } from '@angular/core/testing';
import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { TableDataSource, TableRow, TableSortDirection } from '@hypertrace/components';
import { TimeDurationModel } from '@hypertrace/dashboards';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { ExploreSpecificationBuilder } from '../../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { EXPLORE_GQL_REQUEST } from '../../../../../graphql/request/handlers/explore/explore-query';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model';
import { ExploreSpecification } from './../../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreTableDataSourceModel } from './explore-table-data-source.model';

describe('Explore table data source model', () => {
  const specBuilder = new ExploreSpecificationBuilder();
  let tableDataSource: TableDataSource<TableRow, SpecificationBackedTableColumnDef<ExploreSpecification>>;
  let lastEmittedQuery: unknown;
  let spectator!: SpectatorModel<ExploreTableDataSourceModel>;

  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            results: [
              {
                name: 'test-name',
                duration: 100
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
    spectator = buildModel(ExploreTableDataSourceModel);
    spectator.model.api = mockApi as ModelApi;
    spectator.model.context = 'Context';

    spectator.model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
    spectator.model.getData().subscribe(dataSource => (tableDataSource = dataSource));
  });

  test('builds expected request for required properties', fakeAsync(() => {
    tableDataSource.getData({
      position: {
        startIndex: 0,
        limit: 50
      },
      columns: [
        {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        {
          id: 'duration',
          specification: specBuilder.exploreSpecificationForKey('duration')
        }
      ],
      sort: {
        column: {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        direction: TableSortDirection.Descending
      }
    });

    // Query is debounced, flush it out
    flush();
    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'Context',
        selections: [expect.objectContaining({ name: 'name' }), expect.objectContaining({ name: 'duration' })],
        limit: 100,
        offset: 0,
        orderBy: [
          {
            direction: TableSortDirection.Descending,
            key: expect.objectContaining({ name: 'name' })
          }
        ],
        filters: [],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime)
      })
    );
  }));

  test('builds expected request with Interval', fakeAsync(() => {
    spectator.model.interval = new TimeDurationModel();
    spectator.model.interval.value = 1;
    spectator.model.interval.unit = TimeUnit.Minute;

    tableDataSource.getData({
      position: {
        startIndex: 0,
        limit: 50
      },
      columns: [
        {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        {
          id: 'duration',
          specification: specBuilder.exploreSpecificationForKey('duration')
        }
      ],
      sort: {
        column: {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        direction: TableSortDirection.Descending
      }
    });

    // Query is debounced, flush it out
    flush();
    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'Context',
        selections: [expect.objectContaining({ name: 'name' }), expect.objectContaining({ name: 'duration' })],
        interval: expect.objectContaining(new TimeDuration(1, TimeUnit.Minute)),
        limit: 100,
        offset: 0,
        orderBy: [
          {
            direction: TableSortDirection.Descending,
            key: expect.objectContaining({ name: 'name' })
          }
        ],
        filters: [],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime)
      })
    );
  }));

  test('builds expected request with group by', fakeAsync(() => {
    spectator.model.groupBy = ['name'];
    spectator.model.groupByIncludeRest = false;

    tableDataSource.getData({
      position: {
        startIndex: 0,
        limit: 50
      },
      columns: [
        {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        {
          id: 'duration',
          specification: specBuilder.exploreSpecificationForKey('duration')
        }
      ],
      sort: {
        column: {
          id: 'Name',
          specification: specBuilder.exploreSpecificationForKey('name')
        },
        direction: TableSortDirection.Descending
      }
    });

    // Query is debounced, flush it out
    flush();
    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'Context',
        selections: [expect.objectContaining({ name: 'name' }), expect.objectContaining({ name: 'duration' })],
        limit: 100,
        offset: 0,
        groupBy: expect.objectContaining({
          keys: ['name'],
          includeRest: false
        }),
        orderBy: [
          {
            direction: TableSortDirection.Descending,
            key: expect.objectContaining({ name: 'name' })
          }
        ],
        filters: [],
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime)
      })
    );
  }));
});
