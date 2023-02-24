import { Color, FeatureState, TimeRangeResolver } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { IconSize } from '../icon/icon-size';

export type NavItemConfig = NavItemLinkConfig | NavItemHeaderConfig | NavItemDividerConfig;

export interface NavItemLinkConfig {
  type: NavItemType.Link;
  icon: string;
  iconSize?: IconSize;
  label: string;
  matchPaths: string[]; // For now, default path is index 0
  hidden?: boolean;
  features?: string[];
  replaceCurrentHistory?: boolean;
  isBeta?: boolean;
  trailingIcon?: string;
  trailingIconTooltip?: string;
  trailingIconColor?: Color;
  timeRangeResolver?: TimeRangeResolver;
  pageLevelTimeRangeIsEnabled?: boolean;
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

export interface NavItemGroup {
  label: string;
  icon: string;
  navItems: NavItemConfig[];
  displayNavList: boolean;
  hideNavGroup?: boolean;
}

export const enum NavViewStyle {
  DarkViewStyleClass = 'navigation-dark'
}
