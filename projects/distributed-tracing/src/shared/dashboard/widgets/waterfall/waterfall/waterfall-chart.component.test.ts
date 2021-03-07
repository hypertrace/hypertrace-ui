import { discardPeriodicTasks, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { DEFAULT_COLOR_PALETTE, LayoutChangeService, NavigationService } from '@hypertrace/common';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { SpanType } from '../../../../graphql/model/schema/span';
import { WaterfallData } from './waterfall-chart';
import { WaterfallChartComponent } from './waterfall-chart.component';
import { WaterfallChartModule } from './waterfall-chart.module';

describe('Waterfall Chart component', () => {
  const data: WaterfallData[] = [
    {
      id: 'first-id',
      isCurrentExecutionEntrySpan: true,
      parentId: '',
      startTime: 1571339873680,
      endTime: 1571339873680,
      duration: {
        value: 1,
        units: 'ms'
      },
      name: 'Span Name 1',
      serviceName: 'Service Name 1',
      protocolName: 'Protocol Name 1',
      spanType: SpanType.Entry,
      requestHeaders: {},
      requestBody: 'Request Body',
      responseHeaders: {},
      responseBody: 'Response Body',
      tags: {}
    },
    {
      id: 'second-id',
      isCurrentExecutionEntrySpan: false,
      parentId: 'first-id',
      startTime: 1571339873680,
      endTime: 1571339873680,
      duration: {
        value: 2,
        units: 'ms'
      },
      name: 'Span Name 2',
      serviceName: 'Service Name 2',
      protocolName: 'Protocol Name 2',
      spanType: SpanType.Exit,
      requestHeaders: {},
      requestBody: '',
      responseHeaders: {},
      responseBody: '',
      tags: {}
    },
    {
      id: 'third-id',
      isCurrentExecutionEntrySpan: false,
      parentId: 'first-id',
      startTime: 1571339873680,
      endTime: 1571339873680,
      duration: {
        value: 2,
        units: 'ms'
      },
      name: 'Span Name 3',
      serviceName: 'Service Name 1',
      protocolName: 'Protocol Name 3',
      spanType: SpanType.Exit,
      requestHeaders: {},
      requestBody: '',
      responseHeaders: {},
      responseBody: '',
      tags: {}
    }
  ];

  const createHost = createHostFactory<WaterfallChartComponent>({
    component: WaterfallChartComponent,
    providers: [
      {
        provide: DEFAULT_COLOR_PALETTE,
        useValue: {
          name: 'default',
          colors: []
        }
      },
      mockProvider(ActivatedRoute, {
        queryParamMap: EMPTY
      }),
      ...getMockFlexLayoutProviders()
    ],
    mocks: [NavigationService, LayoutChangeService],
    declareComponent: false,
    imports: [WaterfallChartModule, IconLibraryTestingModule]
  });

  test('renders the chart', fakeAsync(() => {
    const spectator = createHost('<ht-waterfall-chart [data]="data"></ht-waterfall-chart>', {
      hostProps: {
        data: data
      }
    });

    spectator.tick(200);

    const table = spectator.query('ht-table')!;
    expect(table).toExist();

    const chart = spectator.query('ht-sequence-chart')!;
    expect(chart).toExist();

    // Should set initial selection based on data
    expect(spectator.component.selectedNode?.id).toEqual('first-id');

    discardPeriodicTasks();
  }));

  test('gets callback when collapsing all', fakeAsync(() => {
    const spectator = createHost('<ht-waterfall-chart [data]="data"></ht-waterfall-chart>', {
      hostProps: {
        data: data
      }
    });
    spectator.tick();

    const spy = spyOn(spectator.component, 'onToggleAll');
    spectator.component.onCollapseAll();
    spectator.tick(200);

    expect(spy).toHaveBeenCalled();
  }));

  test('gets callback when expanding all', fakeAsync(() => {
    const spectator = createHost('<ht-waterfall-chart [data]="data"></ht-waterfall-chart>', {
      hostProps: {
        data: data
      }
    });
    spectator.tick();

    const spy = spyOn(spectator.component, 'onToggleAll');
    spectator.component.onExpandAll();
    spectator.tick(200);

    expect(spy).toHaveBeenCalled();
  }));

  test('assign color based on service names', fakeAsync(() => {
    const spectator = createHost('<ht-waterfall-chart [data]="data"></ht-waterfall-chart>', {
      hostProps: {
        data: data
      }
    });

    spectator.tick(200);

    // Check assigned colors
    expect(spectator.component.segments[0].color).toEqual('rgb(0, 83, 215)');
    expect(spectator.component.segments[1].color).toEqual('rgb(112, 167, 255)');
    expect(spectator.component.segments[2].color).toEqual(spectator.component.segments[0].color);

    discardPeriodicTasks();
  }));
});
