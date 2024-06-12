import { IconType } from '@hypertrace/assets-library';
import { IconComponent } from '@hypertrace/components';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { StatusDisplayIconPipe } from './status-display-icon.pipe';
import { StatusDisplayTextPipe } from './status-display-text.pipe';
import { StatusDisplayComponent } from './status-display.component';

describe('Status Display Component', () => {
  const createHost = createHostFactory({
    component: StatusDisplayComponent,
    shallow: true,
    declarations: [MockComponent(IconComponent), StatusDisplayTextPipe, StatusDisplayIconPipe]
  });

  test('should display the status code properly with check icon', () => {
    const spectator = createHost(`<ht-status-display [statusCode]="statusCode"></ht-status-display>`, {
      hostProps: {
        statusCode: 200
      }
    });

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.CheckCircleFill);
    expect(spectator.query('.text')?.textContent).toBe('200');
  });

  test('should display the fail icon', () => {
    const spectator = createHost(
      `<ht-status-display [statusCode]="statusCode" [status]="status"></ht-status-display>`,
      {
        hostProps: {
          status: 'FAIL',
          statusCode: 400
        }
      }
    );

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.AlertFill);
  });

  test('should display the fail icon', () => {
    const spectator = createHost(
      `<ht-status-display [statusCode]="statusCode" [status]="status"></ht-status-display>`,
      {
        hostProps: {
          statusCode: 400
        }
      }
    );

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.AlertFill);
  });

  test('should display the check icon if unknown status is send', () => {
    const spectator = createHost(
      `<ht-status-display [statusCode]="statusCode" [status]="status"></ht-status-display>`,
      {
        hostProps: {
          status: 'SOMETHING',
          statusCode: 200
        }
      }
    );

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.CheckCircleFill);
  });

  test('should display the status code with status message', () => {
    const spectator = createHost(
      `<ht-status-display [statusCode]="statusCode" [statusMessage]="statusMessage"></ht-status-display>`,
      {
        hostProps: {
          statusCode: 200,
          statusMessage: 'OK'
        }
      }
    );

    expect(spectator.query('.text')?.textContent).toBe('200 - OK');
  });
});
