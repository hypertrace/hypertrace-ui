import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, TypedSimpleChanges } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { NavigationListComponentService } from './navigation-list-component.service';
import {
  FooterItemConfig,
  NavItemConfig,
  NavItemGroup,
  NavItemLinkConfig,
  NavItemType,
  NavViewStyle
} from './navigation.config';

@Component({
  selector: 'ht-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" [ngClass]="[!this.collapsed ? 'expanded' : '', this.navViewStyle ?? '']">
      <div class="vertical-scroll-container">
        <div class="content" *htLetAsync="this.activeItem$ as activeItem" [htLayoutChangeTrigger]="this.collapsed">
          <ng-content></ng-content>
          <ng-container *ngFor="let item of this.navItems; let id = index">
            <ng-container [ngSwitch]="item.type">
              <div *ngIf="!this.collapsed">
                <ng-container *ngSwitchCase="'${NavItemType.Header}'">
                  <div *ngIf="item.isVisible$ | async" class="nav-header">
                    <div class="label">{{ item.label }}</div>
                    <ht-beta-tag *ngIf="item.isBeta" class="beta"></ht-beta-tag>
                  </div>
                </ng-container>
              </div>

              <hr *ngSwitchCase="'${NavItemType.Divider}'" class="nav-divider" />

              <ng-container *ngSwitchCase="'${NavItemType.Link}'">
                <ht-nav-item
                  [navItemViewStyle]="this.navViewStyle"
                  [config]="item"
                  [active]="item === activeItem"
                  [collapsed]="this.collapsed"
                ></ht-nav-item>
              </ng-container>
            </ng-container>
          </ng-container>
        </div>

        <div class="resize-tab-button" (click)="this.toggleView()" *ngIf="this.resizable">
          <ht-icon class="resize-icon" [icon]="this.getResizeIcon()" size="${IconSize.Small}"></ht-icon>
        </div>

        <div class="footer" *ngIf="this.footerItems">
          <div class="footer-item" *ngIf="this.navGroup && !this.collapsed">
            <ht-icon class="nav-group-icon" [icon]="this.navGroup?.icon" [size]="'${IconSize.Inherit}'"></ht-icon>
          </div>

          <div class="footer-item" *ngIf="this.navGroup && !this.collapsed">
            <ht-label class="nav-group-label" [label]="this.navGroup?.label" [wrap]="true"></ht-label>
          </div>

          <hr class="nav-divider" />
          <div *ngFor="let footerItem of footerItems" class="footer-item">
            <ht-link class="link" [paramsOrUrl]="footerItem.url">
              <ht-icon *ngIf="this.collapsed" [icon]="footerItem.icon" size="${IconSize.Small}"></ht-icon>
              <ht-label *ngIf="!this.collapsed" [label]="footerItem.label"></ht-label>
            </ht-link>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavigationListComponent implements OnChanges {
  @Input()
  public navGroup?: NavItemGroup;

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

  @Input()
  public readonly navViewStyle?: NavViewStyle;

  @Output()
  public readonly activeItemChange: EventEmitter<NavItemLinkConfig> = new EventEmitter();

  public activeItem$?: Observable<NavItemLinkConfig | undefined>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly navListComponentService: NavigationListComponentService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.navItems) {
      this.navItems = this.navListComponentService.resolveFeaturesAndUpdateVisibilityForNavItems(this.navItems);

      // Must remain subscribed to in template to maintain time range functionality for activeItemChange.
      this.activeItem$ = this.navigationService.navigation$.pipe(
        startWith(this.navigationService.getCurrentActivatedRoute()),
        map(() => {
          const activeItem = this.findActiveItem(this.navItems);
          this.activeItemChange.emit(activeItem);

          return activeItem;
        })
      );
    }
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
