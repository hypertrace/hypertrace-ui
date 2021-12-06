import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { IconRegistryService } from './icon-registry.service';
import { IconType } from './icon-type';

describe('Icon Registry Service', () => {
  const buildService = createServiceFactory({
    service: IconRegistryService
  });
  test('registered injected svg icons', () => {
    const spectator = buildService({
      providers: [mockProvider(MatIconRegistry)]
    });

    spectator.service.registerSvgIcon({
      key: IconType.Hypertrace,
      url: 'test-url'
    });

    expect(spectator.inject(MatIconRegistry).addSvgIcon).toHaveBeenCalledTimes(1);
    expect(spectator.inject(MatIconRegistry).addSvgIcon).toHaveBeenCalledWith(
      'hypertrace',
      spectator.inject(DomSanitizer).bypassSecurityTrustResourceUrl('test-url')
    );
  });

  test('looks up ligature icons', () => {
    const spectator = buildService();

    expect(spectator.service.getIconRenderInfo(IconType.Debug, 'test-label')).toEqual({
      iconRenderType: 'ligature',
      ligatureText: IconType.Debug,
      fontSet: 'material-icons-outlined',
      label: 'test-label'
    });

    expect(spectator.service.getIconRenderInfo(IconType.Debug)).toEqual({
      iconRenderType: 'ligature',
      ligatureText: IconType.Debug,
      fontSet: 'material-icons-outlined',
      label: 'bug_report'
    });
  });

  test('looks up svg icons', () => {
    const spectator = buildService({
      providers: [
        mockProvider(MatIconRegistry, {
          getNamedSvgIcon: jest.fn().mockReturnValue(of('fake-svg'))
        })
      ]
    });

    const svgRenderInfo = spectator.service.getIconRenderInfo(IconType.Hypertrace, 'test-label');
    expect(svgRenderInfo).toEqual({
      iconRenderType: 'svg',
      label: 'test-label',
      svgIcon: 'hypertrace',
      getSvgElement: expect.any(Function)
    });

    runFakeRxjs(({ expectObservable }) => {
      if (svgRenderInfo.iconRenderType === 'svg') {
        expectObservable(svgRenderInfo.getSvgElement()).toBe('(x|)', {
          x: 'fake-svg'
        });
      } else {
        fail('Should be unreachable, this verification was made above');
      }
    });
  });
});
