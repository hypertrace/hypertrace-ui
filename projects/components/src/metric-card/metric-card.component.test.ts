import { IconType } from '@hypertrace/assets-library';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { MetricCardIndicatorType } from './metric-card';
import { MetricCardComponent } from './metric-card.component';

describe('Metric Card Component', () => {
  const createComponent = createComponentFactory({
    component: MetricCardComponent,
    declarations: [MockComponent(IconComponent)],
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        value: 123
      }
    });

    expect(spectator.query('.metric-card')).toExist();
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
});
