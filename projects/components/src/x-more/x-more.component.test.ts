import { TooltipDirective } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';

import { XMoreComponent, XMoreDisplay } from './x-more.component';

describe('X-More Component', () => {
  let spectator: SpectatorHost<XMoreComponent>;

  const createHost = createHostFactory({
    component: XMoreComponent,
    shallow: true,
    declarations: [MockDirective(TooltipDirective)]
  });

  test('should not display if count is 0', () => {
    spectator = createHost(
      `<ht-x-more [count]="count" [tooltip]="value" [displayStyle]="displayStyle">
    </ht-x-more>`,
      {
        hostProps: {
          count: 0,
          value: 'tooltip value',
          displayStyle: XMoreDisplay.Plain
        }
      }
    );

    expect(spectator.query('.summary-text')).not.toExist();
    expect(spectator.query(TooltipDirective)).not.toExist();
  });

  test('should display if count greater than 0', () => {
    spectator = createHost(
      `<ht-x-more [count]="count" [tooltip] = "value" [displayStyle] = "displayStyle">
    </ht-x-more>`,
      {
        hostProps: {
          count: 1,
          value: 'tooltip value',
          displayStyle: XMoreDisplay.Plain
        }
      }
    );

    expect(spectator.query('.summary-text')).toExist();
    expect(spectator.query('.summary-text')).toHaveText('+1');
    expect(spectator.query(TooltipDirective)).toExist();
  });

  test('should contain suffix if provided', () => {
    spectator = createHost(
      `<ht-x-more [count]="count" [tooltip] = "value" [displayStyle] = "displayStyle" [suffix] = "suffix">
    </ht-x-more>`,
      {
        hostProps: {
          count: 1,
          value: 'tooltip value',
          displayStyle: XMoreDisplay.Plain,
          suffix: 'more'
        }
      }
    );

    expect(spectator.query('.summary-text')).toExist();
    expect(spectator.query('.summary-text')).toHaveText('+1');
    expect(spectator.query('.summary-text')).toHaveText('more');
    expect(spectator.query(TooltipDirective)).toExist();
  });
});
