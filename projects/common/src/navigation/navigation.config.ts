import { Observable } from 'rxjs';
import { Color } from '../color/color';
import { FeatureState} from '../feature/state/feature.state';

export type NavItemConfig = NavItemLinkConfig | NavItemHeaderConfig | NavItemDividerConfig;

export interface NavItemLinkConfig {
  type: NavItemType.Link;
  icon: string;
  iconSize?: string;
  label: string;
  matchPaths: string[]; // For now, default path is index 0
  features?: string[];
  replaceCurrentHistory?: boolean;
  isBeta?: boolean;
  trailingIcon?: string;
  trailingIconTooltip?: string;
  trailingIconColor?: Color;
  featureState$?: Observable<FeatureState>;
}

export type FooterItemConfig = FooterItemLinkConfig;

export interface FooterItemLinkConfig {
  url: string;
  label: string;
  icon: string;
}

export interface NavItemHeaderConfig {
  type: NavItemType.Header;
  label: string;
  isBeta?: boolean;
  isVisible$?: Observable<boolean>;
}

export interface NavItemDividerConfig {
  type: NavItemType.Divider;
}

// Must be exported to be used by AOT compiler in template
export const enum NavItemType {
  Header = 'header',
  Link = 'link',
  Divider = 'divider',
  Footer = 'footer'
}
