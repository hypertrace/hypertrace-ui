import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SummaryValueComponent } from '../summary-value/summary-value.component';
import { SummaryCardColor } from './summary-card';
import { SummaryCardComponent } from './summary-card.component';

describe('Summary Card Component', () => {
  let spectator: Spectator<SummaryCardComponent>;

  const createHost = createHostFactory({
    component: SummaryCardComponent,
    declarations: [MockComponent(SummaryValueComponent)],
    shallow: true
  });

  test('should render card', () => {
    spectator = createHost(
      `<htc-summary-card [name]="name" [color]="color" [summaries]="summaries"></htc-summary-card>`,
      {
        hostProps: {
          name: 'I am Card',
          color: SummaryCardColor.Red,
          summaries: [
            {
              value: 'Summary #1',
              icon: 'Icon #1',
              label: 'Label #1',
              tooltip: 'Tooltip #1'
            },
            {
              value: 'Summary #2',
              icon: 'Icon #2'
            }
          ]
        }
      }
    );

    expect(spectator.query('.card')).toExist();
    expect(spectator.query('.dot')).toHaveClass(SummaryCardColor.Red);

    expect(spectator.query('.header')).toContainText('I am Card');
    expect(spectator.query('.header')).toHaveClass(SummaryCardColor.Red);

    const summaries = spectator.queryAll(SummaryValueComponent);
    expect(summaries.length).toEqual(2);

    const firstSummary = summaries[0];
    expect(firstSummary.value).toEqual('Summary #1');
    expect(firstSummary.icon).toEqual('Icon #1');
    expect(firstSummary.label).toEqual('Label #1');
    expect(firstSummary.tooltip).toEqual('Tooltip #1');

    const secondSummary = summaries[1];
    expect(secondSummary.value).toEqual('Summary #2');
    expect(secondSummary.icon).toEqual('Icon #2');
    expect(secondSummary.label).toBeUndefined();
    expect(secondSummary.tooltip).toBeUndefined();
  });
});
