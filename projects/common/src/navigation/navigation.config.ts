import { Observable } from 'rxjs';

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
