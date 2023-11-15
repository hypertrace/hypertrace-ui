import { CommonModule } from '@angular/common';
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
import { of } from 'rxjs';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { SpanTagsDetailComponent } from './span-tags-detail.component';

describe('Span Tags Detail Component', () => {
  let spectator: Spectator<SpanTagsDetailComponent>;

  const createHost = createHostFactory({
    component: SpanTagsDetailComponent,
    imports: [CommonModule, ListViewModule, LoadAsyncModule],
    declarations: [MockComponents(LabelComponent, FilterButtonComponent), MockDirective(TooltipDirective)],
    shallow: true,
    providers: [
      MockProvider(MetadataService, {
        getAllAttributes: jest.fn().mockReturnValue(of([])),
      }),
    ],
  });

  test('should display tag records', () => {
    spectator = createHost(`<ht-span-tags-detail [tags]="tags"></ht-span-tags-detail>`, {
      hostProps: {
        tags: { tag1: 'value1', tag2: 'value2' },
      },
    });

    const listViewElement = spectator.query(ListViewComponent);
    expect(listViewElement).not.toBeNull();
  });
});
