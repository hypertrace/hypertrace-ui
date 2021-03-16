import { FilterBuilderLookupService, TableMode, TableStyle } from '@hypertrace/components';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlFilterDataSourceModel,
  GraphQlOperatorType,
  MetadataService,
  MetricAggregationType,
  TRACES_GQL_REQUEST
} from '@hypertrace/distributed-tracing';
import { Dashboard } from '@hypertrace/hyperdash';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { capitalize } from 'lodash-es';
import { MockService } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { CartesianSeriesVisualizationType } from '../../shared/components/cartesian/chart';
import { ExploreVisualizationRequest } from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { LegendPosition } from '../../shared/components/legend/legend.component';
import { ExplorerVisualizationCartesianDataSourceModel } from '../../shared/dashboard/data/graphql/explorer-visualization/explorer-visualization-cartesian-data-source.model';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';
import { ExplorerDashboardBuilder } from './explorer-dashboard-builder';

describe('Explorer dashboard builder', () => {
  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column
    }
  });
  test('can build dashboard JSON for visualization', done => {
    const builder = new ExplorerDashboardBuilder(MockService(MetadataService), MockService(FilterBuilderLookupService));

    runFakeRxjs(({ expectObservable }) => {
      const dashboardRecording = recordObservable(builder.visualizationDashboard$);

      const mockRequest = {};
      builder.updateForRequest(mockRequest as ExploreVisualizationRequest);

      expectObservable(dashboardRecording).toBe('x', {
        x: {
          json: {
            type: 'cartesian-widget',
            'selectable-interval': false,
            'series-from-data': true,
            'legend-position': LegendPosition.Bottom
          },
          onReady: expect.any(Function)
        }
      });

      dashboardRecording.subscribe(generatedDashboard => {
        const mockDataSource = {
          request: undefined
        };
        const mockDashboard: Partial<Dashboard> = {
          createAndSetRootDataFromModelClass: jest.fn(),
          getRootDataSource: jest.fn().mockReturnValue(mockDataSource)
        };
        generatedDashboard.onReady(mockDashboard as Dashboard);
        expect(mockDashboard.createAndSetRootDataFromModelClass).toHaveBeenCalledWith(
          ExplorerVisualizationCartesianDataSourceModel
        );
        expect(mockDataSource.request).toBe(mockRequest);
        done();
      });
    });
  });

  test('can build dashboard JSON for traces', done => {
    const builder = new ExplorerDashboardBuilder(
      // tslint:disable-next-line: no-object-literal-type-assertion
      {
        getAttribute: (_: never, name: string) =>
          of({
            name: name,
            displayName: capitalize(name),
            type: AttributeMetadataType.Number
          })
      } as MetadataService,
      MockService(FilterBuilderLookupService)
    );

    runFakeRxjs(({ expectObservable }) => {
      const dashboardRecording = recordObservable(builder.resultsDashboard$);
      const series = buildSeries('foo');
      const mockRequest: ExploreVisualizationRequest = {
        context: ObservabilityTraceType.Api,
        series: [series],
        resultLimit: 1000,
        exploreQuery$: EMPTY,
        resultsQuery$: of({
          requestType: TRACES_GQL_REQUEST,
          traceType: ObservabilityTraceType.Api,
          properties: [series.specification],
          filters: [new GraphQlFieldFilter('bar', GraphQlOperatorType.Equals, 'baz')],
          limit: 1000
        })
      };
      builder.updateForRequest(mockRequest);

      expectObservable(dashboardRecording).toBe('x', {
        x: {
          json: {
            type: 'table-widget',
            id: 'explorer.traces-table',
            mode: TableMode.Detail,
            style: TableStyle.Embedded,
            data: {
              type: 'traces-table-data-source',
              trace: ObservabilityTraceType.Api
            },
            'child-template': {
              type: 'trace-detail-widget',
              data: {
                type: 'api-trace-detail-data-source',
                // tslint:disable-next-line: no-invalid-template-strings
                trace: '${row}',
                attributes: ['requestUrl']
              }
            },
            columns: [
              expect.objectContaining({ title: 'Type' }),
              expect.objectContaining({ title: 'Service' }),
              expect.objectContaining({ title: 'Endpoint' }),
              expect.objectContaining({ title: 'Exit Calls' }),
              expect.objectContaining({ title: 'Status' }),
              expect.objectContaining({ title: 'Duration' }),
              expect.objectContaining({ title: 'Start Time' }),
              expect.objectContaining({ title: 'API Boundary Type' }),
              expect.objectContaining({ title: 'API Discovery State' }),
              expect.objectContaining({ title: 'API ID' }),
              expect.objectContaining({ title: 'Entry Span ID' }),
              expect.objectContaining({ title: 'Service ID' }),
              expect.objectContaining({ title: 'Trace ID' }),
              expect.objectContaining({ title: 'Request URL' }),
              expect.objectContaining({ title: 'Foo' })
            ]
          },
          onReady: expect.any(Function)
        }
      });

      dashboardRecording.subscribe(generatedDashboard => {
        const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
          clearFilters: jest.fn().mockReturnThis(),
          addFilters: jest.fn().mockReturnThis()
        };

        const mockDashboard: Partial<Dashboard> = {
          getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
          setTimeRange: jest.fn()
        };
        generatedDashboard.onReady(mockDashboard as Dashboard);
        expect(mockDataSource.clearFilters).toHaveBeenCalled();
        expect(mockDataSource.addFilters).toHaveBeenCalledWith(
          new GraphQlFieldFilter('bar', GraphQlOperatorType.Equals, 'baz')
        );
        done();
      });
    });
  });
});
