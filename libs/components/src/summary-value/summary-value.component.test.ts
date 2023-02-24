import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { SummaryValueComponent, SummaryValueDisplayStyle } from './summary-value.component';
import { SummaryValueModule } from './summary-value.module';

describe('Summary Value Component', () => {
  let spectator: SpectatorHost<SummaryValueComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: SummaryValueComponent,
    imports: [SummaryValueModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [mockProvider(NavigationService)]
  });

  test('should not display anything if value is not present', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value">
      </ht-summary-value>`,
      {
        hostProps: {
          value: undefined
        }
      }
    );

    expect(spectator.query('.icon')).not.toExist();
    expect(spectator.query('.dot')).not.toExist();
    expect(spectator.query('.label')).not.toExist();
    expect(spectator.query('.value')).not.toExist();
  });

  test('should display only value', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23'
        }
      }
    );

    expect(spectator.query('.dot')).toExist();
    expect(spectator.query('.icon')).not.toExist();
    expect(spectator.query('.label')).not.toExist();
    expect(spectator.query('.value')).toHaveText('98.23.456.23');
    expect(spectator.query('.value')?.classList.contains('text')).toBe(true);
    expect(spectator.query('.value')?.classList.contains('link')).toBe(false);
  });

  test('should display both label and value', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value" [label]="label">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23',
          label: 'Ip Address'
        }
      }
    );

    expect(spectator.query('.dot')).toExist();
    expect(spectator.query('.label')).toHaveText('Ip Address:');
    expect(spectator.query('.value')).toHaveText('98.23.456.23');
  });

  test('should display icon, label and value', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value" [label]="label" [icon]="icon">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23',
          label: 'Ip Address',
          icon: IconType.IpAddress
        }
      }
    );

    expect(spectator.query('.dot')).not.toExist();
    expect(spectator.query('ht-icon')).toExist();
    expect(spectator.query('.label')).toHaveText('Ip Address:');
    expect(spectator.query('.value')).toHaveText('98.23.456.23');
  });

  test('includes label in tooltip only if provided', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value" [label]="label" [icon]="icon">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23',
          label: 'IP Address',
          icon: IconType.IpAddress
        }
      }
    );

    expect(spectator.query(TooltipDirective)!.content).toBe('IP Address 98.23.456.23');

    spectator.setHostInput({ label: undefined });
    expect(spectator.query(TooltipDirective)!.content).toBe('98.23.456.23');

    spectator.setHostInput({ value: undefined });
    expect(spectator.query(TooltipDirective)).not.toExist();
  });

  test('use custom tooltip if provided', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value" [label]="label" [icon]="icon" [tooltip]="tooltip">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23',
          label: 'IP Address',
          tooltip: 'test tooltip',
          icon: IconType.IpAddress
        }
      }
    );

    expect(spectator.query(TooltipDirective)!.content).toBe('test tooltip');

    spectator.setHostInput({ tooltip: undefined });
    expect(spectator.query(TooltipDirective)!.content).toBe('IP Address 98.23.456.23');
  });

  test('should make value clickable when isClickable is true', () => {
    spectator = createHost(
      `<ht-summary-value [value]="value" [icon]="icon" [summaryValueDisplayStyle]="valueStyle">
      </ht-summary-value>`,
      {
        hostProps: {
          value: '98.23.456.23',
          icon: IconType.IpAddress,
          valueStyle: SummaryValueDisplayStyle.Link
        }
      }
    );

    expect(spectator.query('.value')?.classList.contains('link')).toBe(true);
    expect(spectator.query('.value')?.classList.contains('text')).toBe(false);
  });
});
