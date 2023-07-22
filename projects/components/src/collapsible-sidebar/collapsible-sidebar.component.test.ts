import { IconType } from '@hypertrace/assets-library';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { EventBlockerComponent } from '../event-blocker/event-blocker.component';
import { IconComponent } from '../icon/icon.component';
import { CollapsibleSidebarComponent } from './collapsible-sidebar.component';

describe('Collapsible Sidebar Component', () => {
  const createHost = createHostFactory({
    component: CollapsibleSidebarComponent,
    shallow: true,
    declarations: [MockComponents(EventBlockerComponent, IconComponent)]
  });

  test('should render content correclty', () => {
    const spectator = createHost(
      `<ht-collapsible-sidebar label="test-label"><div class="test-content"></div></ht-collapsible-sidebar>`
    );

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.TriangleRight);
    expect(spectator.query('.test-content')).not.toExist();
    expect(spectator.query('.string-label')).toHaveText('test-label');

    spectator.click(spectator.query('.toggle') as Element);

    expect(spectator.query(IconComponent)?.icon).toBe(IconType.TriangleLeft);
    expect(spectator.query('.test-content')).toExist();
    expect(spectator.query('.string-label')).not.toExist();
  });
});
