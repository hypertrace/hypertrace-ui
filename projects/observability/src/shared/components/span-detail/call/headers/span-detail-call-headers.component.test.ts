import { CommonModule } from '@angular/common';
import { Dictionary } from '@hypertrace/common';
import {
  FilterButtonComponent,
  FilterUrlService,
  LabelComponent,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  TooltipDirective
} from '@hypertrace/components';
import { mockProvider } from '@ngneat/spectator';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponents, MockDirective } from 'ng-mocks';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';

describe('Span Detail Call Headers Component', () => {
  let spectator: Spectator<SpanDetailCallHeadersComponent>;

  const mockData: Dictionary<unknown> = {
    test: 'test-name'
  };
  const mockTitle: string = 'Header';
  const mockFieldName: string = 'testHeader';

  const createHost = createHostFactory({
    component: SpanDetailCallHeadersComponent,
    declarations: [MockComponents(LabelComponent, FilterButtonComponent), MockDirective(TooltipDirective)],
    imports: [CommonModule, ListViewModule, LoadAsyncModule],
    providers: [
      mockProvider(FilterUrlService, {
        getAllFilterAttributesForScope: jest.fn().mockReturnValue([]),
      })
    ],
    shallow: true
  });

  test('should display span detail call headers component', () => {
    spectator = createHost(
      `<ht-span-detail-call-headers [data]="data" [title]="title" [fieldName]="fieldName"></ht-span-detail-call-headers>`,
      {
        hostProps: {
          data: mockData,
          title: mockTitle,
          fieldName: mockFieldName
        }
      }
    );

    expect(spectator.query(LabelComponent)?.label).toBe(mockTitle);
    expect(spectator.query(ListViewComponent)?.records).toEqual([
      {
        key: 'test',
        value: 'test-name'
      }
    ]);
  });
});
