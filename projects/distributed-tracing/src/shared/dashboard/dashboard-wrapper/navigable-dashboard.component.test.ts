import {
  Filter,
  FilterAttributeType,
  FilterBarComponent,
  FilterOperator,
  LoadAsyncModule
} from '@hypertrace/components';
import { DashboardPersistenceService } from '@hypertrace/dashboards';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { Dashboard } from '@hypertrace/hyperdash';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterDataSourceModel } from '../data/graphql/filter/graphql-filter-data-source.model';
import { ApplicationAwareDashboardComponent } from './application-aware-dashboard.component';
import { NavigableDashboardComponent } from './navigable-dashboard.component';

describe('Navigable dashboard component', () => {
  const hostFactory = createHostFactory({
    component: NavigableDashboardComponent,
    imports: [LoadAsyncModule],
    declarations: [MockComponent(ApplicationAwareDashboardComponent), MockComponent(FilterBarComponent)],
    providers: [
      mockProvider(MetadataService, {
        getFilterAttributes: () => of([])
      })
    ],
    template: `
      <ht-navigable-dashboard
        [defaultJson]="defaultJson"
        [navLocation]="navLocation"
        [filterConfig]="filterConfig">
      </ht-navigable-dashboard>
    `
  });

  test('uses default JSON if no dashboard registered', () => {
    const defaultJson = { type: 'my-default-model' };
    const spectator = hostFactory(undefined, {
      hostProps: {
        defaultJson: defaultJson,
        navLocation: 'my-location'
      }
    });

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(defaultJson);
    expect(spectator.query(FilterBarComponent)).not.toExist();
  });

  test('looks up a registered dashboard', () => {
    const registeredJson = { type: 'my-registered-model' };
    const spectator = hostFactory(undefined, {
      hostProps: {
        navLocation: 'my-location'
      },
      detectChanges: false
    });

    spectator.inject(DashboardPersistenceService).setDefaultForLocation('my-location', { content: registeredJson });
    spectator.detectChanges();

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(registeredJson);
  });

  test('prefers a registered dashboard over provided default', () => {
    const registeredJson = { type: 'my-registered-model' };
    const defaultJson = { type: 'my-default-model' };
    const spectator = hostFactory(undefined, {
      hostProps: {
        navLocation: 'my-location',
        defaultJson: defaultJson
      },
      detectChanges: false
    });

    spectator.inject(DashboardPersistenceService).setDefaultForLocation('my-location', { content: registeredJson });
    spectator.detectChanges();

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(registeredJson);
  });

  test('applies a provided implicit filter', () => {
    const defaultJson = { type: 'my-default-model' };
    const implicitFilter = new GraphQlFieldFilter('foo', GraphQlOperatorType.Equals, 'bar');
    const spectator = hostFactory(undefined, {
      hostProps: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          implicitFilters: [implicitFilter]
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(implicitFilter);
    expect(mockDashboard.refresh).toHaveBeenCalled();
  });

  test('applies filter updates', () => {
    const defaultJson = { type: 'my-default-model' };
    const spectator = hostFactory(undefined, {
      hostProps: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          filterBar: { scope: 'my-scope' }
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    const explicitFilter: Filter = {
      metadata: {
        name: 'test',
        displayName: 'Test',
        type: FilterAttributeType.String
      },
      field: 'foo',
      operator: FilterOperator.Equals,
      value: 'bar',
      userString: '',
      urlString: ''
    };
    spectator.query(FilterBarComponent)?.filtersChange.next([explicitFilter]);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'foo', operator: GraphQlOperatorType.Equals, value: 'bar' })
    );
  });

  test('can hide a filter bar with implicit filters', () => {
    const implicitFilter = new GraphQlFieldFilter('foo', GraphQlOperatorType.Equals, 'bar');
    const defaultJson = { type: 'my-default-model' };
    const spectator = hostFactory(undefined, {
      hostProps: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          implicitFilters: [implicitFilter]
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(implicitFilter);
    expect(mockDashboard.refresh).toHaveBeenCalled();
    expect(spectator.query(FilterBarComponent)).not.toExist();
  });
});
