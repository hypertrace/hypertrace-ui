import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { isEmpty, orderBy } from 'lodash-es';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private static readonly SVG_ICON_PREFIX: string = 'svg:';

  private registeredIcons: string[] = [];

  public constructor(private readonly matIconRegistry: MatIconRegistry, private readonly sanitizer: DomSanitizer) {}

  public registerSvgIcon(iconInfo: SvgIconRegistrationInfo): void {
    if (!this.registeredIcons.includes(iconInfo.key)) {
      this.registeredIcons.push(iconInfo.key);
      this.registeredIcons = orderBy(this.registeredIcons, key => key, 'asc');
    }

    this.matIconRegistry.addSvgIcon(
      this.getIconNameWithoutPrefix(iconInfo.key),
      this.sanitizer.bypassSecurityTrustResourceUrl(iconInfo.url)
    );
  }

  public getIconRenderInfo(icon: string, label?: string): IconRenderInfo {
    const iconName = this.getIconNameWithoutPrefix(icon);
    const labelOrDefault = !isEmpty(label) ? label! : iconName;

    if (icon.startsWith(IconRegistryService.SVG_ICON_PREFIX)) {
      return {
        iconRenderType: 'svg',
        svgIcon: iconName,
        label: labelOrDefault,
        getSvgElement: () => this.matIconRegistry.getNamedSvgIcon(iconName)
      };
    }

    return {
      iconRenderType: 'ligature',
      ligatureText: iconName,
      label: labelOrDefault,
      fontSet: 'material-icons-outlined'
    };
  }

  public getIconNameWithoutPrefix(icon: string): string {
    return icon.startsWith(IconRegistryService.SVG_ICON_PREFIX)
      ? icon.substring(IconRegistryService.SVG_ICON_PREFIX.length)
      : icon;
  }

  public getRegisteredIcons(): string[] {
    return this.registeredIcons;
  }
}

export type IconRenderInfo = LigatureIconRenderInfo | SvgIconRenderInfo;

interface LigatureIconRenderInfo {
  iconRenderType: 'ligature';
  ligatureText: string;
  fontSet: string;
  label: string;
}

interface SvgIconRenderInfo {
  iconRenderType: 'svg';
  label: string;
  svgIcon: string;

  getSvgElement(): Observable<SVGElement>;
}

export interface SvgIconRegistrationInfo {
  key: string;
  url: string;
}
