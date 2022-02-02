import { Color } from '@hypertrace/common';
import { TooltipDirective } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';

import { SummaryBoxComponent, SummaryBoxDisplay } from './summary-box.component';

describe('Summary Box Component', () => {
  let spectator: SpectatorHost<SummaryBoxComponent>;

  const createHost = createHostFactory({
    component: SummaryBoxComponent,
    shallow: true,
    declarations: [MockDirective(TooltipDirective)]
  });

  test('should not display if count is 0', () => {
    spectator = createHost(
      `<ht-summary-box [count]="count" [tooltip]="value" [displayStyle]="displayStyle">
    </ht-summary-box>`,
      {
        hostProps: {
          count: 0,
          value: 'tooltip value',
          displayStyle: SummaryBoxDisplay.Plain
        }
      }
    );

    expect(spectator.query('.summary-text')).not.toExist();
    expect(spectator.query(TooltipDirective)).not.toExist();
  });

  test('should display if count greater than 0', () => {
    spectator = createHost(
      `<ht-summary-box [count]="count" [tooltip] = "value" [displayStyle] = "displayStyle">
    </ht-summary-box>`,
      {
        hostProps: {
          count: 1,
          value: 'tooltip value',
          displayStyle: SummaryBoxDisplay.Plain
        }
      }
    );

    expect(spectator.query('.summary-text')).toExist();
    expect(spectator.query('.summary-text')).toHaveText('+1');
    expect(spectator.query(TooltipDirective)).toExist();
  });

  test('should have plain background for any background color if display style is plain', () => {
    spectator = createHost(
      `<ht-summary-box [count]="count" [tooltip] = "value"
      [backgroundColor] = "background" [displayStyle] = "style">
      </ht-summary-box>`,
      {
        hostProps: {
          count: 1,
          value: 'tooltip value',
          style: SummaryBoxDisplay.Plain,
          background: Color.Blue3
        }
      }
    );

    expect(spectator.query('.summary-text')).toExist();
    expect(spectator.query(TooltipDirective)).toExist();
    expect(spectator.query('.summary-text')).toHaveText('+1');
    expect(spectator.component.backgroundColor).toBe(Color.White);
  });
});
