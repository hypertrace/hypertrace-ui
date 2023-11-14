import { FormattingModule } from '@hypertrace/common';
import { XMoreComponent } from '@hypertrace/components';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { StringArrayDisplayComponent } from './string-array-display.component';

describe('String array Display component', () => {
  const buildHost = createHostFactory({
    component: StringArrayDisplayComponent,
    declarations: [MockComponent(XMoreComponent)],
    imports: [FormattingModule],
    shallow: true,
  });

  test('should render an array with one item as expected', () => {
    const spectator = buildHost(`<ht-string-array-display [values]="values"></ht-string-array-display>`, {
      hostProps: {
        values: ['foo 1', 'bar 1', 'foo 2', 'bar 2'],
      },
    });

    expect(spectator.query('.first-item')).toHaveText('foo 1');
    expect(spectator.query(XMoreComponent)?.count).toBe(3);

    spectator.setHostInput({
      values: undefined,
    });

    expect(spectator.query('.first-item')).not.toExist();
    expect(spectator.query(XMoreComponent)).not.toExist();
  });
});
