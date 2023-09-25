import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { JsonViewerComponent, ListViewComponent, ToggleButtonGroupComponent } from '@hypertrace/components';
import { SpanRequestDetailComponent } from './span-request-detail.component';
import { MockComponents } from 'ng-mocks';
import { SpanDetailCallBodyComponent } from '../call/body/span-detail-call-body.component';
import { CommonModule } from '@angular/common';
import { SpanDetailCallHeadersComponent } from '../call/headers/span-detail-call-headers.component';

describe('Span request detail component', () => {
  let spectator: Spectator<SpanRequestDetailComponent>;

  const createHost = createHostFactory({
    component: SpanRequestDetailComponent,
    shallow: true,
    declarations:[MockComponents(SpanDetailCallHeadersComponent, SpanDetailCallBodyComponent)],
    imports: [CommonModule]
  });

  test('should display headers and body title', () => {
    spectator = createHost(`<ht-span-request-detail title="Headers"></ht-span-request-detail>`);

    const headerTitleElement = spectator.query<HTMLElement>('.call-headers > .title');
    expect(headerTitleElement).not.toBeNull();
    expect(headerTitleElement!.textContent!.trim()).toEqual('Headers');

    const titleElement = spectator.query<HTMLElement>('.call-body > .header > .title');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent!.trim()).toEqual('Body');
  });

  test('should display header records', () => {
    spectator = createHost(`<ht-span-request-detail [requestHeaders]="requestHeaders"></ht-span-request-detail>`, {
      hostProps: {
        requestHeaders: { header1: 'value1', header2: 'value2' }
      }
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });

  test('should display body', () => {
    spectator = createHost(`<ht-span-request-detail [requestBody]="requestBody"></ht-span-request-detail>`, {
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
