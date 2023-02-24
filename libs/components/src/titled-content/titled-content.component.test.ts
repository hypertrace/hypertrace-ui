import { fakeAsync } from '@angular/core/testing';
import { LayoutChangeService, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';
import { LayoutChangeTriggerDirective } from '../layout/layout-change-trigger.directive';
import { TitledContentComponent } from './titled-content.component';
import { TitledContentModule } from './titled-content.module';

describe('Titled content component', () => {
  let spectator: Spectator<TitledContentComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: TitledContentComponent,
    imports: [TitledContentModule],
    declarations: [MockDirective(LayoutChangeTriggerDirective)],
    componentProviders: [LayoutChangeService],
    providers: [mockProvider(NavigationService)]
  });

  test('should render content with no title provided', () => {
    spectator = createHost(
      `
    <ht-titled-content>
      My content
    </ht-titled-content>
    `
    );

    expect(spectator.query('.content')).toHaveText('My content');
    expect(spectator.query('.title')).not.toExist();
  });

  test('should render content and title i', () => {
    spectator = createHost(
      `
      <ht-titled-content>
        My content
      </ht-titled-content>
      `,
      {
        props: {
          title: 'Example title'
        }
      }
    );

    expect(spectator.query('.title')).toHaveText('Example title');
    expect(spectator.query('.content')).toHaveText('My content');
  });

  test('should render header control', fakeAsync(() => {
    spectator = createHost(
      `
      <ht-titled-content>
        My content
        <div *htTitledHeaderControl class="projected-control">Header Control</div>
      </ht-titled-content>
      `
    );
    spectator.tick();
    expect(spectator.query('.controls')).toExist();
    expect(spectator.query('.projected-control')).toHaveText('Header Control');
  }));
});
