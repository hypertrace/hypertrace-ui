import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

import {
  JsonViewerModule,
  LabelModule,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  ToggleButtonModule
} from '@hypertrace/components';
import { SpanTagsDetailComponent } from './span-tags-detail.component';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';

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
      HttpClientTestingModule
    ],
    providers: [mockProvider(ExplorerService)]
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
