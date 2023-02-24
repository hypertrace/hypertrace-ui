// tslint:disable:completed-docs
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIcon } from '@angular/material/icon';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { IconComponent } from './icon.component';
import { IconModule } from './icon.module';

describe('Icon component', () => {
  const buildHost = createHostFactory({
    component: IconComponent,
    imports: [IconModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [mockProvider(NavigationService)]
  });

  test('uses svg attribute for icons backed by svgs', () => {
    const spectator = buildHost(
      `<ht-icon icon="${IconType.Hypertrace}">
       </ht-icon>`
    );

    expect(spectator.query(MatIcon)!.svgIcon).toBe('hypertrace');
    expect(spectator).toHaveExactText('');
    expect(spectator.query('.ht-icon')).toHaveAttribute('aria-label', 'hypertrace');
  });

  test('should apply custom color if provided', () => {
    const spectator = buildHost(
      `<ht-icon icon="${IconType.Hypertrace}" color="#FEA395">
       </ht-icon>`
    );

    expect(spectator.query('.ht-icon')).toHaveAttribute('style', 'color: rgb(254, 163, 149);');
  });

  test('uses ligatures for icons backed by ligature', () => {
    const spectator = buildHost(
      `<ht-icon icon="${IconType.Add}" label="other label">
       </ht-icon>`
    );

    expect(spectator.query(MatIcon)!.svgIcon).toBe('');
    expect(spectator.query('.ht-icon')).toHaveExactText(IconType.Add);
    expect(spectator.query('.ht-icon')).toHaveAttribute('aria-label', 'other label');
  });
});
