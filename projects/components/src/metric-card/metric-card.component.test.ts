import { IconType } from '@hypertrace/assets-library';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { LabelComponent } from '../label/label.component';
import { MetricCardIndicatorType, MetricCardLayout } from './metric-card';
import { MetricCardComponent } from './metric-card.component';

describe('Metric Card Component', () => {
  const createComponent = createComponentFactory({
    component: MetricCardComponent,
    declarations: [MockComponent(IconComponent), MockComponent(LabelComponent)],
    shallow: true
  });

  test('should render everything correctly for card with indicator', () => {
    const spectator = createComponent({
      props: {
        value: 123,
        layoutType: MetricCardLayout.CardWithIndicator
      }
    });

    expect(spectator.query('.metric-card')).toExist();
    expect(spectator.query('.card-with-indicator')).toExist();
    expect(spectator.query('.card-with-large-icon')).not.toExist();
    expect(spectator.query('.dot')).toExist();
    expect(spectator.query('.value')).toHaveText('123');
    expect(spectator.query(IconComponent)).not.toExist();

    spectator.setInput({
      icon: IconType.Add,
      indicator: MetricCardIndicatorType.Icon
    });

    expect(spectator.query('.dot')).not.toExist();
    expect(spectator.query(IconComponent)).toExist();
  });

  test('should render everything correctly for card with large icon', () => {
    const spectator = createComponent({
      props: {
        value: 123,
        titleText: 'test text',
        layoutType: MetricCardLayout.CardWithLargeIcon,
        icon: IconType.Add
      }
    });

    expect(spectator.query('.metric-card')).toExist();
    expect(spectator.query('.card-with-indicator')).not.toExist();
    expect(spectator.query('.card-with-large-icon')).toExist();
    expect(spectator.query('.value')).toHaveText('123');
    expect(spectator.query(LabelComponent)?.label).toBe('test text');
    expect(spectator.query(IconComponent)).toExist();
  });
});
