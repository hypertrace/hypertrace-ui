import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { ButtonComponent, IconComponent, LabelComponent, PopoverModule } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { LabelDetailComponent } from './label-detail.component';

describe('Label Detail Component', () => {
  let spectator: Spectator<LabelDetailComponent>;

  const createHost = createHostFactory({
    component: LabelDetailComponent,
    shallow: true,
    imports: [PopoverModule],
    declarations: [MockComponent(ButtonComponent), MockComponent(LabelComponent), MockComponent(IconComponent)],
    providers: [
      mockProvider(NavigationService, {
        navigation$: of(true)
      })
    ]
  });

  test('should render all contents', () => {
    spectator = createHost(
      `<trace-label-detail [icon]="icon" [label]="label" [description]="description" [additionalDetails]="additionalDetails"></trace-label-detail>`,
      {
        hostProps: {
          icon: IconType.Add,
          label: 'Imapact',
          description: 'This is a test description',
          additionalDetails: ['Additional Detail 1', 'Additional Detail 2']
        }
      }
    );
  });
});
