import { IconType } from '@hypertrace/assets-library';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent, MockDirective } from 'ng-mocks';
import { SummaryValueComponent, SummaryValueDisplayStyle } from '../summary-value/summary-value.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { SummaryValuesComponent } from './summary-values.component';

describe('Summary Values Component', () => {
  let spectator: SpectatorHost<SummaryValuesComponent>;

  const createHost = createHostFactory({
    component: SummaryValuesComponent,
    shallow: true,
    declarations: [MockComponent(SummaryValueComponent), MockDirective(TooltipDirective)]
  });

  test('should pass on inputs correct to child component when multiple values are present', () => {
    spectator = createHost(
      `<ht-summary-values [values]="values" [icon]="icon" [label]="label" [tooltip]="tooltip" [summaryValueDisplayStyle]="summaryValueDisplayStyle">
      </ht-summary-values>`,
      {
        hostProps: {
          values: ['val1', 'val2', 'val3', 'val4', 'val5'],
          icon: IconType.Add,
          label: 'label',
          tooltip: 'label tooltip',
          summaryValueDisplayStyle: SummaryValueDisplayStyle.Text
        }
      }
    );

    const summaryValueComponent = spectator.query(SummaryValueComponent);
    expect(summaryValueComponent).toExist();
    expect(summaryValueComponent?.value).toEqual('val1');
    expect(summaryValueComponent?.icon).toEqual(IconType.Add);
    expect(summaryValueComponent?.label).toEqual('label');
    expect(summaryValueComponent?.tooltip).toEqual('label tooltip');
    expect(summaryValueComponent?.summaryValueDisplayStyle).toEqual(SummaryValueDisplayStyle.Text);

    expect(spectator.query('.additional-values')).toHaveText('+4');
    expect(spectator.query(TooltipDirective)?.content).toBeDefined();
  });

  test('should hide additional details if single value is present', () => {
    spectator = createHost(
      `<ht-summary-values [values]="values" [icon]="icon" [label]="label" [tooltip]="tooltip" [summaryValueDisplayStyle]="summaryValueDisplayStyle">
      </ht-summary-values>`,
      {
        hostProps: {
          values: ['val1'],
          icon: IconType.Add,
          label: 'label',
          tooltip: 'label tooltip',
          summaryValueDisplayStyle: SummaryValueDisplayStyle.Text
        }
      }
    );

    const summaryValueComponent = spectator.query(SummaryValueComponent);
    expect(summaryValueComponent).toExist();
    expect(summaryValueComponent?.value).toEqual('val1');
    expect(summaryValueComponent?.icon).toEqual(IconType.Add);
    expect(summaryValueComponent?.label).toEqual('label');
    expect(summaryValueComponent?.tooltip).toEqual('label tooltip');
    expect(summaryValueComponent?.summaryValueDisplayStyle).toEqual(SummaryValueDisplayStyle.Text);

    expect(spectator.query('.additional-values')).not.toExist();
    expect(spectator.query(TooltipDirective)).not.toExist();
  });

  test('should hide additional details if empty array is passed as value', () => {
    spectator = createHost(
      `<ht-summary-values [values]="values" [icon]="icon" [label]="label" [tooltip]="tooltip" [summaryValueDisplayStyle]="summaryValueDisplayStyle">
      </ht-summary-values>`,
      {
        hostProps: {
          values: [],
          icon: IconType.Add,
          label: 'label',
          tooltip: 'label tooltip',
          summaryValueDisplayStyle: SummaryValueDisplayStyle.Text
        }
      }
    );

    const summaryValueComponent = spectator.query(SummaryValueComponent);
    expect(summaryValueComponent).toExist();
    expect(summaryValueComponent?.value).not.toExist();
    expect(summaryValueComponent?.icon).toEqual(IconType.Add);
    expect(summaryValueComponent?.label).toEqual('label');
    expect(summaryValueComponent?.tooltip).toEqual('label tooltip');
    expect(summaryValueComponent?.summaryValueDisplayStyle).toEqual(SummaryValueDisplayStyle.Text);

    expect(spectator.query('.additional-values')).not.toExist();
    expect(spectator.query(TooltipDirective)).not.toExist();
  });
});
