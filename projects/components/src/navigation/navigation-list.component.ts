import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'htc-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" [ngClass]="{ expanded: !this.collapsed }">
      <div class="content" *htcLetAsync="this.activeItem$ as activeItem" [htcLayoutChangeTrigger]="this.collapsed">
        <ng-container *ngFor="let item of this.navItems">
          <ng-container [ngSwitch]="item.type">
            <div *ngIf="!this.collapsed">
              <div *ngSwitchCase="'${NavItemType.Header}'" class="nav-header">
                <div class="label">{{ item.label }}</div>
                <htc-beta-tag *ngIf="item.isBeta" class="beta"></htc-beta-tag>
              </div>
            </div>

            <hr *ngSwitchCase="'${NavItemType.Divider}'" class="nav-divider" />

            <ng-container *ngSwitchCase="'${NavItemType.Link}'">
              <htc-nav-item
                [config]="item"
                [active]="item === activeItem"
                [collapsed]="this.collapsed"
                (click)="this.navigate(item)"
              >
              </htc-nav-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>

      <div class="resize-tab-button" (click)="this.toggleView()" *ngIf="this.resizable">
        <htc-icon class="resize-icon" [icon]="this.getResizeIcon()" size="${IconSize.Small}"></htc-icon>
      </div>

      <div class="footer" *ngIf="this.footerItems">
        <hr class="nav-divider" />

        <div *ngFor="let footerItem of footerItems" class="footer-item">
          <htc-link class="link" [url]="footerItem.url">
            <htc-icon *ngIf="this.collapsed" [icon]="footerItem.icon" size="${IconSize.Small}"></htc-icon>
            <htc-label *ngIf="!this.collapsed" [label]="footerItem.label"></htc-label>
          </htc-link>
        </div>
      </div>
    </nav>
  `
})
export class NavigationListComponent {
  @Input()
  public navItems: NavItemConfig[] = [];

  @Input()
  public footerItems?: FooterItemConfig[];

  @Input()
  public collapsed?: boolean = false;

  @Input()
  public resizable?: boolean = true;

  @Output()
  public readonly collapsedChange: EventEmitter<boolean> = new EventEmitter();

  public readonly activeItem$: Observable<NavItemLinkConfig | undefined>;

  public constructor(private readonly navigationService: NavigationService) {
    this.activeItem$ = this.navigationService.navigation$.pipe(
      startWith(this.navigationService.getCurrentActivatedRoute()),
      map(() => this.findActiveItem(this.navItems))
    );
  }

  public navigate(item: NavItemLinkConfig): void {
    this.navigationService.navigateWithinApp(item.matchPaths[0]);
  }

  public toggleView(): void {
    if (this.resizable) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  public getResizeIcon(): IconType {
    return this.collapsed ? IconType.TriangleRight : IconType.TriangleLeft;
  }

  private findActiveItem(navItems: NavItemConfig[]): NavItemLinkConfig | undefined {
    return navItems
      .filter((item): item is NavItemLinkConfig => item.type === NavItemType.Link)
      .find(linkItem =>
        linkItem.matchPaths.some(matchPath =>
          this.navigationService.isRelativePathActive([matchPath], this.navigationService.rootRoute())
        )
      );
  }
}

export type NavItemConfig = NavItemLinkConfig | NavItemHeaderConfig | NavItemDividerConfig;

export interface NavItemLinkConfig {
  type: NavItemType.Link;
  icon: string;
  label: string;
  matchPaths: string[]; // For now, default path is index 0
  features?: string[];
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
