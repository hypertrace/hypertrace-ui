import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" [ngClass]="{ expanded: !this.collapsed }">
      <div class="content" *htLetAsync="this.activeItem$ as activeItem" [htLayoutChangeTrigger]="this.collapsed">
        <ng-container *ngFor="let item of this.navItems">
          <ng-container [ngSwitch]="item.type">
            <div *ngIf="!this.collapsed">
              <div *ngSwitchCase="'${NavItemType.Header}'" class="nav-header">
                <div class="label">{{ item.label }}</div>
                <ht-beta-tag *ngIf="item.isBeta" class="beta"></ht-beta-tag>
              </div>
            </div>

            <hr *ngSwitchCase="'${NavItemType.Divider}'" class="nav-divider" />

            <ng-container *ngSwitchCase="'${NavItemType.Link}'">
              <ht-nav-item
                [config]="item"
                [active]="item === activeItem"
                [collapsed]="this.collapsed"
                (click)="this.navigate(item)"
              >
              </ht-nav-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>

      <div class="resize-tab-button" (click)="this.toggleView()" *ngIf="this.resizable">
        <ht-icon class="resize-icon" [icon]="this.getResizeIcon()" size="${IconSize.Small}"></ht-icon>
      </div>

      <div class="footer" *ngIf="this.footerItems">
        <hr class="nav-divider" />

        <div *ngFor="let footerItem of footerItems" class="footer-item">
          <ht-link class="link" [paramsOrUrl]="footerItem.url">
            <ht-icon *ngIf="this.collapsed" [icon]="footerItem.icon" size="${IconSize.Small}"></ht-icon>
            <ht-label *ngIf="!this.collapsed" [label]="footerItem.label"></ht-label>
          </ht-link>
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

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.activeItem$ = this.navigationService.navigation$.pipe(
      startWith(this.navigationService.getCurrentActivatedRoute()),
      map(() => this.findActiveItem(this.navItems))
    );
  }

  public navigate(item: NavItemLinkConfig): void {
    this.navigationService.navigateWithinApp(item.matchPaths[0], this.activatedRoute, undefined, item.shadow);
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
          this.navigationService.isRelativePathActive([matchPath], this.activatedRoute)
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
  shadow?: boolean;
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
