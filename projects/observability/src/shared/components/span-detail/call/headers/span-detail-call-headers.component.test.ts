import { Dictionary, MemoizeModule, NavigationParamsType } from '@hypertrace/common';
import {
  LabelComponent,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  TooltipDirective
} from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponents, MockDirective } from 'ng-mocks';
import { of } from 'rxjs';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';
import { CommonModule } from '@angular/common';
import { ExplorerService } from '../../../../../pages/explorer/explorer-service';
import { ExploreFilterLinkComponent } from '../../../explore-filter-link/explore-filter-link.component';

describe('Span Detail Call Headers Component', () => {
  let spectator: Spectator<SpanDetailCallHeadersComponent>;

  const mockData: Dictionary<unknown> = {
    test: 'test-name'
  };
  const mockTitle: string = 'Header';
  const mockFilterName: string = 'testHeader';

  const createHost = createHostFactory({
    component: SpanDetailCallHeadersComponent,
    declarations: [MockComponents(LabelComponent, ExploreFilterLinkComponent), MockDirective(TooltipDirective)],
    imports: [CommonModule, MemoizeModule, ListViewModule, LoadAsyncModule],
    shallow: true,
    providers: [
      mockProvider(ExplorerService, {
        buildNavParamsWithFilters: jest.fn().mockReturnValue(
          of({
            navType: NavigationParamsType.InApp,
            path: 'test-'
          })
        )
      })
    ]
  });

  test('should display span detail call headers component', () => {
    spectator = createHost(
      `<ht-span-detail-call-headers [data]="data" [title]="title" [filterName]="filterName"></ht-span-detail-call-headers>`,
      {
        hostProps: {
          data: mockData,
          title: mockTitle,
          filterName: mockFilterName
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
