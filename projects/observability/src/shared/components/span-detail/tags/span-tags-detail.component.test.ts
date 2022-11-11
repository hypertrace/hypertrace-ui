import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MemoizeModule, NavigationService } from '@hypertrace/common';
import {
  JsonViewerModule,
  LabelModule,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  ToggleButtonModule
} from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { ExploreFilterLinkComponent } from '../../explore-filter-link/explore-filter-link.component';
import { SpanTagsDetailComponent } from './span-tags-detail.component';

describe('Span Tags Detail Component', () => {
  let spectator: Spectator<SpanTagsDetailComponent>;

  const createHost = createHostFactory({
    component: SpanTagsDetailComponent,
    imports: [
      CommonModule,
      ToggleButtonModule,
      ListViewModule,
      JsonViewerModule,
      LabelModule,
      LoadAsyncModule,
      HttpClientTestingModule,
      MemoizeModule
    ],
    declarations: [MockComponent(ExploreFilterLinkComponent)],
    providers: [
      mockProvider(ExplorerService),
      mockProvider(NavigationService, { getAllValuesForQueryParameter: () => [] })
    ]
  });

  test('should display tag records', () => {
    spectator = createHost(`<ht-span-tags-detail [tags]="tags"></ht-span-tags-detail>`, {
      hostProps: {
        tags: { tag1: 'value1', tag2: 'value2' }
      }
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });
});
