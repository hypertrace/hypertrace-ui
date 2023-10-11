import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { NavigationParamsType, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { JsonViewerComponent, ListViewComponent, ToggleButtonGroupComponent } from '@hypertrace/components';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { SpanResponseDetailComponent } from './span-response-detail.component';
import { SpanResponseDetailModule } from './span-response-detail.module';

describe('Span response detail component', () => {
  let spectator: Spectator<SpanResponseDetailComponent>;

  const createHost = createHostFactory({
    component: SpanResponseDetailComponent,
    imports: [SpanResponseDetailModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [
      mockProvider(NavigationService),
      mockProvider(ExplorerService, {
        buildNavParamsWithFilters: jest.fn().mockReturnValue(
          of({
            navType: NavigationParamsType.InApp,
            path: 'test-'
          })
        )
      }),
      mockProvider(ActivatedRoute),
      MockProvider(MetadataService, {
        getAllAttributes: jest.fn().mockReturnValue(of([]))
      })
    ]
  });

  test('should display headers and body title', () => {
    spectator = createHost(`<ht-span-response-detail title="Headers"></ht-span-response-detail>`);

    const headerTitleElement = spectator.query<HTMLElement>('.call-headers > .title');
    expect(headerTitleElement).not.toBeNull();
    expect(headerTitleElement!.textContent!.trim()).toEqual('Headers');

    const titleElement = spectator.query<HTMLElement>('.call-body  > .header > .title');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent!.trim()).toEqual('Body');
  });

  test('should display header records', () => {
    spectator = createHost(`<ht-span-response-detail [responseHeaders]="responseHeaders"></ht-span-response-detail>`, {
      hostProps: {
        responseHeaders: { header1: 'value1', header2: 'value2' }
      }
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });

  test('should display body', () => {
    spectator = createHost(`<ht-span-response-detail [responseBody]="responseBody"></ht-span-response-detail>`, {
      hostProps: {
        responseBody: '[{"data": 5000}]'
      }
    });

    const toggleButtonElement = spectator.query(ToggleButtonGroupComponent);
    expect(toggleButtonElement).not.toBeNull();

    const jsonViewerElement = spectator.query(JsonViewerComponent);
    expect(jsonViewerElement).not.toBeNull();
  });
});
