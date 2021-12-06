import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { LayoutChangeService, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { PanelComponent } from './panel.component';
import { PanelModule } from './panel.module';

describe('Panel component', () => {
  let spectator: Spectator<PanelComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: PanelComponent,
    providers: [mockProvider(LayoutChangeService), mockProvider(NavigationService)],
    imports: [PanelModule, HttpClientTestingModule, IconLibraryTestingModule]
  });

  test('renders header content', () => {
    spectator = createHost(
      `<ht-panel>
        <ht-panel-header>
          <div class="title">{{title}}</div>
          <div class="summary">{{summary}}</div>
        </ht-panel-header>
      </ht-panel>`,
      {
        hostProps: {
          title: 'Results',
          summary: '(508 Records)'
        }
      }
    );
    expect(spectator.query('.title')).toHaveText('Results');
    expect(spectator.query('.summary')).toHaveText('(508 Records)');
  });

  test('renders body content', () => {
    spectator = createHost(
      `<ht-panel [expanded]="expanded">
        <ht-panel-header>
          <div class="title">{{title}}</div>
          <div class="summary">{{summary}}</div>
        </ht-panel-header>
        <ht-panel-body>
          <div>Body Content</div>
        </ht-panel-body>
      </ht-panel>`,
      {
        hostProps: {
          expanded: false,
          title: 'Results',
          summary: '(508 Records)'
        }
      }
    );
    expect(spectator.query('.title')).toHaveText('Results');
    expect(spectator.query('.summary')).toHaveText('(508 Records)');
    expect(spectator.query('.body')).not.toExist();

    spectator.click('.title');
    expect(spectator.query('.body')).toHaveText('Body Content');
  });

  test('renders body content with no header', () => {
    spectator = createHost(
      `<ht-panel [expanded]="true">
        <ht-panel-body>
          <div>Body Content</div>
        </ht-panel-body>
      </ht-panel>`,
      {
        hostProps: {
          expanded: false
        }
      }
    );

    expect(spectator.query('.body')).toHaveText('Body Content');
  });

  test('emits correct expansion state change', () => {
    const onExpansionChange: jest.Mock = jest.fn();

    spectator = createHost(
      `<ht-panel (expandedChange)="onExpansionChange($event)">
        <ht-panel-header>
          <span class="test">Test Content</span>
        </ht-panel-header>
      </ht-panel>`,
      {
        hostProps: {
          onExpansionChange: onExpansionChange
        }
      }
    );

    spectator.click('.test');
    expect(onExpansionChange).toHaveBeenCalledWith(false);

    spectator.click('.test');
    expect(onExpansionChange).toHaveBeenCalledWith(true);
  });
});
