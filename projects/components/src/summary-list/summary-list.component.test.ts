import { IconType } from '@hypertrace/assets-library';
import { IconComponent, LabelComponent, SummaryListComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';

describe('Summary List component', () => {
  let spectator: SpectatorHost<SummaryListComponent>;

  const createHost = createHostFactory({
    component: SummaryListComponent,
    shallow: true,
    declarations: [MockComponent(IconComponent), MockComponent(LabelComponent)]
  });

  beforeEach(() => {
    spectator = createHost(
      `
      <ht-summary-list
        [title]="title"
        [icon]="icon"
        [items]="items"
      ></ht-summary-list>`,
      {
        hostProps: {
          title: 'My Title',
          icon: IconType.Add,
          items: [
            {
              label: 'number',
              value: 0
            },
            {
              label: 'Number-Array',
              value: [0, 1, 2]
            },
            {
              label: 'STRING',
              value: 'zero'
            },
            {
              label: 'STRING_ARRAY',
              value: ['zero', 'one', 'two', 'three']
            },
            {
              label: 'bOOleAN',
              value: true
            },
            {
              label: 'boolean-array',
              value: [true, false]
            }
          ]
        }
      }
    );
  });

  test('sets title and icon', () => {
    expect(spectator.query('.summary-icon', { read: IconComponent })?.icon).toEqual(IconType.Add);
    expect(spectator.query('.summary-title', { read: LabelComponent })?.label).toEqual('My Title');
  });

  test('formats label', () => {
    const labelComponents = spectator.queryAll('.summary-value-title', { read: LabelComponent });
    expect(labelComponents.map(c => c.label)).toEqual([
      'Number',
      'Number Array',
      'String',
      'String Array',
      'Boolean',
      'Boolean Array'
    ]);
  });

  test('gets value array', () => {
    const values = spectator.queryAll('li').map(e => e.textContent?.trim());
    expect(values).toEqual(['0', '0', '1', '2', 'zero', 'zero', 'one', 'two', 'three', 'true', 'true', 'false']);
  });
});
