import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';

import {
  JsonViewerModule,
  LabelModule,
  ListViewComponent,
  ListViewModule,
  LoadAsyncModule,
  ToggleButtonModule
} from '@hypertrace/components';
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
      HttpClientTestingModule
    ]
  });

  test('should display tag records', () => {
    spectator = createHost(`<htc-span-tags-detail [tags]="tags"></htc-span-tags-detail>`, {
      hostProps: {
        tags: { tag1: 'value1', tag2: 'value2' }
      }
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });
});
