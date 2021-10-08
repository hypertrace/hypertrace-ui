import { fakeAsync, tick } from '@angular/core/testing';
import { MemoizeModule, NavigationService } from '@hypertrace/common';
import { LoadAsyncModule } from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ExploreFilterLinkComponent } from '../../shared/components/explore-filter-link/explore-filter-link.component';
import { ExplorerService } from '../explorer/explorer-service';
import { ApiTraceDetailPageComponent } from './api-trace-detail.page.component';
import { ApiTraceDetails, ApiTraceDetailService } from './api-trace-detail.service';
describe('Api Trace Details Page Component', () => {
  const mockTraceDetails: ApiTraceDetails = {
    id: 'test-id',
    traceId: 'test-123',
    type: 'trace-type',
    timeString: 'test-time-string',
    titleString: 'test-title',
    startTime: 'test-start-time'
  };

  const createComponent = createComponentFactory({
    component: ApiTraceDetailPageComponent,
    shallow: true,
    providers: [
      mockProvider(NavigationService),
      mockProvider(ExplorerService, {
        buildNavParamsWithFilters: jest.fn().mockReturnValue(of('traceId_eq_test-123'))
      })
    ],
    imports: [LoadAsyncModule, MemoizeModule],
    componentProviders: [
      mockProvider(ApiTraceDetailService, {
        fetchTraceDetails: jest.fn().mockReturnValue(of(mockTraceDetails))
      })
    ],
    declarations: [MockComponent(ExploreFilterLinkComponent)]
  });

  test('should render content correctly', fakeAsync(() => {
    const spectator = createComponent();

    spectator.click('.label');
    tick();
    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalled();

    spectator.click('.full-trace-button');
    tick();
    expect(spectator.inject(NavigationService).navigateWithinApp).toHaveBeenCalledWith([
      '/trace',
      mockTraceDetails.traceId,
      { startTime: mockTraceDetails.startTime }
    ]);
  }));

  test('should render explorer link component', fakeAsync(() => {
    const spectator = createComponent();
    expect(spectator.query(ExploreFilterLinkComponent)?.paramsOrUrl).toBe('traceId_eq_test-123');
  }));
});
