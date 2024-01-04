import { FixedTimeRange } from '@hypertrace/common';
import { createModelFactory, mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { TracesTableDataSourceModel } from './traces-table-data-source.model';
import { switchMap } from 'rxjs/operators';
import { TableDataRequest } from '@hypertrace/components';
import { SpecificationBackedTableColumnDef } from '@hypertrace/observability';

describe('Traces Table Data Source Model', () => {
  const buildModel = createModelFactory({
    providers: [...mockDashboardProviders],
  });

  test('response parsing should work as expected when ignoreTotal = true, response length < limit', () => {
    const spectator = buildModel(TracesTableDataSourceModel, {
      api: {
        getTimeRange: jest.fn().mockReturnValue(new FixedTimeRange(new Date(0), new Date(10))),
      },
      properties: {
        ignoreTotal: true,
      },
    });

    runFakeRxjs(({ expectObservable }) => {
      spectator.model.query$.subscribe(query => {
        query.responseObserver.next({
          results: [],
        });
        query.responseObserver.complete();
      });

      expectObservable(
        spectator.model.getData().pipe(
          switchMap(data =>
            data.getData({
              position: { startIndex: 0, limit: 50 },
            } as TableDataRequest<SpecificationBackedTableColumnDef>),
          ),
        ),
      ).toBe('(x|)', {
        x: {
          data: [],
          totalCount: 0,
        },
      });
    });
  });

  test('response parsing should work as expected when ignoreTotal = true, response length >= limit', () => {
    const spectator = buildModel(TracesTableDataSourceModel, {
      api: {
        getTimeRange: jest.fn().mockReturnValue(new FixedTimeRange(new Date(0), new Date(10))),
      },
      properties: {
        ignoreTotal: true,
      },
    });

    runFakeRxjs(({ expectObservable }) => {
      spectator.model.query$.subscribe(query => {
        query.responseObserver.next({
          results: [
            {
              'test-spec-alias': {
                value: 1,
              },
            },
          ],
        });
        query.responseObserver.complete();
      });

      expectObservable(
        spectator.model.getData().pipe(
          switchMap(data =>
            data.getData({
              position: { startIndex: 0, limit: 1 },
            } as TableDataRequest<SpecificationBackedTableColumnDef>),
          ),
        ),
      ).toBe('(x|)', {
        x: {
          data: [
            {
              'test-spec-alias': {
                value: 1,
              },
            },
          ],
          totalCount: -1,
        },
      });
    });
  });

  test('response parsing should work as expected when ignoreTotal = false', () => {
    const spectator = buildModel(TracesTableDataSourceModel, {
      api: {
        getTimeRange: jest.fn().mockReturnValue(new FixedTimeRange(new Date(0), new Date(10))),
      },
      properties: {
        ignoreTotal: false,
      },
    });

    runFakeRxjs(({ expectObservable }) => {
      spectator.model.query$.subscribe(query => {
        query.responseObserver.next({
          results: [
            {
              'test-spec-alias': {
                value: 1,
              },
            },
          ],
          total: 10,
        });
        query.responseObserver.complete();
      });

      expectObservable(
        spectator.model.getData().pipe(
          switchMap(data =>
            data.getData({
              position: { startIndex: 0, limit: 50 },
            } as TableDataRequest<SpecificationBackedTableColumnDef>),
          ),
        ),
      ).toBe('(x|)', {
        x: {
          data: [
            {
              'test-spec-alias': {
                value: 1,
              },
            },
          ],
          totalCount: 10,
        },
      });
    });
  });
});
