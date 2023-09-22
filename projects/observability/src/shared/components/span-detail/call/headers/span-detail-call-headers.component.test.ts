import { Dictionary } from '@hypertrace/common';
import { LabelComponent, ListViewComponent } from '@hypertrace/components';
import { ExplorerService } from '@hypertrace/observability';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';
import { SpanDetailCallHeadersModule } from './span-detail-call-headers.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Span Detail Call Headers Component', () => {
  let spectator: Spectator<SpanDetailCallHeadersComponent>;

  const mockData: Dictionary<unknown> = {
    test: 'test-name'
  };
  const mockTitle: string = 'Header';
  const mockFilterName: string = 'testHeader';

  const createHost = createHostFactory({
    component: SpanDetailCallHeadersComponent,
    imports: [SpanDetailCallHeadersModule, HttpClientTestingModule],
    shallow: true,
    declareComponent: false,
    providers: [
      mockProvider(ExplorerService, {
        buildNavParamsWithFilters: jest.fn().mockReturnValue(of('http://test-url.abc'))
      })
    ]
  });

  test('should display span detail call headers component', () => {
    spectator = createHost(`<ht-span-detail-call-headers [data]="data" [title]="title" [filterName]="filterName"></ht-span-detail-call-headers>`, {
      hostProps: {
        data: mockData,
        title: mockTitle,
        filterName: mockFilterName
      }
    });

    expect(spectator.query(LabelComponent)?.label).toBe(mockTitle);
    expect(spectator.query(ListViewComponent)?.records).toEqual([{
      key: 'test',
      value: 'test-name'
    }]);
  });
});