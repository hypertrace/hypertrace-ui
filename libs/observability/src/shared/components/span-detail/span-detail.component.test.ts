import { fakeAsync } from '@angular/core/testing';
import { ToggleGroupComponent } from '@hypertrace/components';
import { SpanDetailTab } from '@hypertrace/observability';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SpanRequestDetailComponent } from './request/span-request-detail.component';
import { SpanResponseDetailComponent } from './response/span-response-detail.component';
import { SpanData } from './span-data';
import { SpanDetailComponent } from './span-detail.component';
import { SpanTagsDetailComponent } from './tags/span-tags-detail.component';

describe('Span detail component', () => {
  let spectator: Spectator<SpanDetailComponent>;

  const createHost = createHostFactory({
    component: SpanDetailComponent,
    shallow: true,
    declarations: [
      MockComponent(SpanRequestDetailComponent),
      MockComponent(SpanResponseDetailComponent),
      MockComponent(SpanTagsDetailComponent),
      MockComponent(ToggleGroupComponent)
    ]
  });

  test('should display child components', fakeAsync(() => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: { header1: 'value1', header2: 'value2' },
      requestCookies: { cookie1: 'value1', cookie2: 'value2' },
      requestBody: '[{"data": 5000}]',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseCookies: { cookie1: 'value1', cookie2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url',
      startTime: 1604567825671
    };

    spectator = createHost(`<ht-span-detail [spanData]="spanData"></ht-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });
    spectator.tick();
    expect(spectator.query(ToggleGroupComponent)).toExist();
    expect(spectator.query(SpanRequestDetailComponent)).toExist();
  }));

  test('should hide Request tab if both request header params and body are absent', fakeAsync(() => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: {},
      requestCookies: {},
      requestBody: '',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseCookies: { cookie1: 'value1', cookie2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url',
      startTime: 1604567825671
    };

    spectator = createHost(`<ht-span-detail [spanData]="spanData"></ht-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });

    spectator.tick();
    expect(spectator.component.tabs.findIndex(tab => tab.value === SpanDetailTab.Request)).toEqual(-1);
    // Response tab will be selected as it's the first tab
    expect(spectator.query(SpanResponseDetailComponent)).toExist();
  }));

  test('should show Request tab if either request header params and body are present', fakeAsync(() => {
    const spanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: {},
      requestCookies: {},
      requestBody: '[{"data": 5000}]',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseCookies: { cookie1: 'value1', cookie2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url',
      startTime: 1604567825671
    };

    spectator = createHost(`<ht-span-detail [spanData]="spanData"></ht-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });
    spectator.tick();

    expect(spectator.query(SpanRequestDetailComponent)).toExist();
  }));

  test('should hide Response tab if both response header params and body are absent', fakeAsync(() => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: { header1: 'value1', header2: 'value2' },
      requestCookies: { cookie1: 'value1', cookie2: 'value2' },
      requestBody: '[{"data": 5000}]',
      responseHeaders: {},
      responseCookies: {},
      responseBody: '',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url',
      startTime: 1604567825671
    };

    spectator = createHost(`<ht-span-detail [spanData]="spanData"></ht-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });
    spectator.tick();
    expect(spectator.component.tabs.findIndex(tab => tab.value === SpanDetailTab.Response)).toEqual(-1);
    // Request tab will be selected as its the first one
    expect(spectator.query(SpanRequestDetailComponent)).toExist();
  }));
});
