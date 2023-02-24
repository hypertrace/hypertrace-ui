import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ExpanderToggleComponent } from './expander-toggle.component';
import { ExpanderToggleModule } from './expander-toggle.module';

describe('Expander component', () => {
  let spectator: Spectator<ExpanderToggleComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: ExpanderToggleComponent,
    imports: [ExpanderToggleModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [mockProvider(NavigationService)]
  });

  test('renders correct icon and tooltip for expanded state', () => {
    spectator = createHost(
      `<ht-expander-toggle [expanded]="expanded">
      </ht-expander-toggle>`,
      {
        hostProps: {
          expanded: true
        }
      }
    );

    expect(spectator.query('ht-icon')).toExist();
    expect(spectator.component.getTooltipText()).toEqual(ExpanderToggleComponent.COLLAPSE);
    expect(spectator.component.getIconType()).toEqual(IconType.Expanded);
  });

  test('renders correct icon and tooltip for collapsed state', () => {
    spectator = createHost(
      `<ht-expander-toggle [expanded]="expanded">
      </ht-expander-toggle>`,
      {
        hostProps: {
          expanded: false
        }
      }
    );

    expect(spectator.query('ht-icon')).toExist();
    expect(spectator.component.getTooltipText()).toEqual(ExpanderToggleComponent.EXPAND);
    expect(spectator.component.getIconType()).toEqual(IconType.Collapsed);
  });
});
