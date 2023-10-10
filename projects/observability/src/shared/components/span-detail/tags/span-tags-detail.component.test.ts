import { CommonModule } from '@angular/common';
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
import { SpanTagsDetailComponent } from './span-tags-detail.component';

describe('Span Tags Detail Component', () => {
  let spectator: Spectator<SpanTagsDetailComponent>;

  const createHost = createHostFactory({
    component: SpanTagsDetailComponent,
    imports: [CommonModule, ListViewModule, LoadAsyncModule],
    declarations: [MockComponents(LabelComponent, FilterButtonComponent), MockDirective(TooltipDirective)],
    providers: [
      mockProvider(FilterUrlService, {
        getAllFilterAttributesForScope: jest.fn().mockReturnValue([])
      })
    ],
    shallow: true
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
