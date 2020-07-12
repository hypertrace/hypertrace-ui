// tslint:disable: max-file-line-count
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { ApiDefinitionWidgetRendererComponent } from './api-definition-widget-renderer.component';
import { ApiDefinitionWidgetModule } from './api-definition-widget.module';
import { ApiDefinitionData, ApiParamType } from './data/api-definition-data-source.model';

describe('API Definition Widget renderer', () => {
  let mockResponse: ApiDefinitionData;

  const createComponent = createComponentFactory<ApiDefinitionWidgetRendererComponent>({
    component: ApiDefinitionWidgetRendererComponent,
    providers: [
      {
        provide: RENDERER_API,
        useValue: {
          getTimeRange: jest.fn(),
          model: {
            getData: jest.fn(() => of(mockResponse))
          },
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        }
      },
      mockProvider(GraphQlRequestService, {
        queryImmediately: () => EMPTY
      }),
      ...getMockFlexLayoutProviders()
    ],
    mocks: [NavigationService],
    declareComponent: false,
    imports: [ApiDefinitionWidgetModule, HttpClientTestingModule, IconLibraryTestingModule]
  });

  test('renders the widget', fakeAsync(() => {
    mockResponse = {
      id: 'test-id',
      uri: 'test-uri',
      params: [
        {
          name: 'param1',
          valueType: 'STRING',
          parameterType: ApiParamType.Query,
          pii: 'email'
        }
      ],
      requestBodySchema: '',
      responseBodySchema: ''
    };

    const spectator = createComponent();
    spectator.tick(200);

    const uriElement = spectator.query('.header > .uri')!;
    expect(uriElement).toExist();
    expect(uriElement).toHaveText('URI');

    spectator.tick();

    const uriValueElement = spectator.query('.header > .value > span')!;

    expect(uriValueElement).toExist();
    expect(uriValueElement).toHaveText('test-uri');

    // Check request view
    const requestDetailElement = spectator.query('.details > .request')!;

    expect(requestDetailElement).toExist();
  }));

  test('renders the response component', fakeAsync(() => {
    mockResponse = {
      id: 'test-id',
      uri: 'test-uri',
      params: [
        {
          name: 'param1',
          valueType: 'STRING',
          parameterType: ApiParamType.Query,
          pii: 'email'
        }
      ],
      requestBodySchema: '',
      responseBodySchema: ''
    };

    const spectator = createComponent();
    spectator.component.selectedView = spectator.component.response;

    spectator.tick(200);

    const responseDetailElement = spectator.query('.details > .response')!;
    expect(responseDetailElement).toExist();
  }));
});
