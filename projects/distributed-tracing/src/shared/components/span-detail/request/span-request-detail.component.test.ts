import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { JsonViewerComponent, ListViewComponent, ToggleButtonGroupComponent } from '@hypertrace/components';
import { SpanRequestDetailComponent } from './span-request-detail.component';
import { SpanRequestDetailModule } from './span-request-detail.module';

describe('Span request detail component', () => {
  let spectator: Spectator<SpanRequestDetailComponent>;

  const createHost = createHostFactory({
    component: SpanRequestDetailComponent,
    imports: [SpanRequestDetailModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [mockProvider(NavigationService)]
  });

  test('should display headers and body title', () => {
    spectator = createHost(`<htc-span-request-detail></htc-span-request-detail>`);

    const headerTitleElement = spectator.query<HTMLElement>('.call-headers > .title');
    expect(headerTitleElement).not.toBeNull();
    expect(headerTitleElement!.textContent!.trim()).toEqual('Headers');

    const titleElement = spectator.query<HTMLElement>('.call-body > .title');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent!.trim()).toEqual('Body');
  });

  test('should display header records', () => {
    spectator = createHost(`<htc-span-request-detail [requestHeaders]="requestHeaders"></htc-span-request-detail>`, {
      hostProps: {
        requestHeaders: { header1: 'value1', header2: 'value2' }
      }
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });

  test('should display body', () => {
    spectator = createHost(`<htc-span-request-detail [requestBody]="requestBody"></htc-span-request-detail>`, {
      hostProps: {
        requestBody: '[{"data": 5000}]'
      }
    });

    const toggleButtonElement = spectator.query(ToggleButtonGroupComponent);
    expect(toggleButtonElement).not.toBeNull();

    const jsonViewerElement = spectator.query(JsonViewerComponent);
    expect(jsonViewerElement).not.toBeNull();
  });
});
