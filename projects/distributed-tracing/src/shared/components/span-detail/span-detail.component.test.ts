import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { SpanData } from './span-data';
import { SpanDetailComponent } from './span-detail.component';
import { SpanDetailModule } from './span-detail.module';

describe('Span detail component', () => {
  let spectator: Spectator<SpanDetailComponent>;

  const createHost = createHostFactory({
    component: SpanDetailComponent,
    imports: [SpanDetailModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [mockProvider(NavigationService)]
  });

  test('should display child components', () => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: { header1: 'value1', header2: 'value2' },
      requestBody: '[{"data": 5000}]',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url'
    };

    spectator = createHost(`<htc-span-detail [spanData]="spanData"></htc-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });

    expect(spectator.query<HTMLElement>('htc-tab-group')).toExist();
    expect(spectator.query<HTMLElement>('htc-span-request-detail')).toExist();
  });

  test('should hide Request tab if both request header params and body are absent', fakeAsync(() => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: {},
      requestBody: '',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url'
    };

    spectator = createHost(`<htc-span-detail [spanData]="spanData"></htc-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });

    spectator.tick();

    expect(spectator.query<HTMLElement>('.request')).not.toExist();
  }));

  test('should show Request tab if either request header params and body are present', fakeAsync(() => {
    const spanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: {},
      requestBody: '[{"data": 5000}]',
      responseHeaders: { header1: 'value1', header2: 'value2' },
      responseBody: '[{"data": 5000}]',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url'
    };

    spectator = createHost(`<htc-span-detail [spanData]="spanData"></htc-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });
    spectator.tick();

    expect(spectator.query('.request')).toExist();
  }));

  test('should hide Response tab if both response header params and body are absent', fakeAsync(() => {
    const spanData: SpanData = {
      id: '2',
      serviceName: 'My Service Name',
      apiName: 'My API Name',
      protocolName: 'My Protocol Name',
      requestHeaders: { header1: 'value1', header2: 'value2' },
      requestBody: '[{"data": 5000}]',
      responseHeaders: {},
      responseBody: '',
      tags: { tag1: 'value1', tag2: 'value2' },
      requestUrl: 'test-url'
    };

    spectator = createHost(`<htc-span-detail [spanData]="spanData"></htc-span-detail>`, {
      hostProps: {
        spanData: spanData
      }
    });
    spectator.tick();

    expect(spectator.query<HTMLElement>('.response')).not.toExist();
  }));
});
