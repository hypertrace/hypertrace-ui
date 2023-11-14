import { CommonModule } from '@angular/common';
import { Dictionary } from '@hypertrace/common';
import {
  FilterButtonComponent,
  LabelComponent,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  TooltipDirective,
} from '@hypertrace/components';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponents, MockDirective, MockProvider } from 'ng-mocks';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { of } from 'rxjs';

describe('Span Detail Call Headers Component', () => {
  let spectator: Spectator<SpanDetailCallHeadersComponent>;

  const mockData: Dictionary<unknown> = {
    test: 'test-name',
  };
  const mockTitle: string = 'Header';
  const mockFieldName: string = 'testHeader';

  const createHost = createHostFactory({
    component: SpanDetailCallHeadersComponent,
    declarations: [MockComponents(LabelComponent, FilterButtonComponent), MockDirective(TooltipDirective)],
    imports: [CommonModule, ListViewModule, LoadAsyncModule],
    shallow: true,
    providers: [
      MockProvider(MetadataService, {
        getAllAttributes: jest.fn().mockReturnValue(of([])),
      }),
    ],
  });

  test('should display span detail call headers component', () => {
    spectator = createHost(
      `<ht-span-detail-call-headers [data]="data" [title]="title" [fieldName]="fieldName"></ht-span-detail-call-headers>`,
      {
        hostProps: {
          data: mockData,
          title: mockTitle,
          fieldName: mockFieldName,
        },
      },
    );

    expect(spectator.query(LabelComponent)?.label).toBe(mockTitle);
    expect(spectator.query(ListViewComponent)?.records).toEqual([
      {
        key: 'test',
        value: 'test-name',
      },
    ]);
  });
});
