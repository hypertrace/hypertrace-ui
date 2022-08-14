import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationParamsType, NavigationService } from '@hypertrace/common';
import { ButtonRole, ButtonStyle, ToggleItem } from '@hypertrace/components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./custom-dashboards.component.scss'],
  template: `
    <div class="custom-dashboards">
      <div class="title">
        <h2>Custom Dashboards</h2>
        <ht-link [paramsOrUrl]="this.currentContext.value + '/create'" class="create-dashboard-button">
          <ht-button role="${ButtonRole.Primary}" display="${ButtonStyle.Solid}" label="Create Dashboard"> </ht-button>
        </ht-link>
      </div>
      <ht-toggle-group
        class="context-data-toggle"
        [items]="this.contextItems"
        [activeItem]="this.currentContext"
        (activeItemChange)="this.onContextChange($event)"
      ></ht-toggle-group>
      <router-outlet></router-outlet>
    </div>
  `
})
export class CustomDashboardsViewComponent {
  public currentContext: ToggleItem = {};
  public readonly contextItems: ToggleItem<string>[] = [
    {
      label: 'My Dashboards',
      value: DASHBOARD_VIEWS.MY_DASHBOARDS
    },
    {
      label: 'All Dashboards',
      value: DASHBOARD_VIEWS.ALL_DASHBOARDS
    }
  ];
  public constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params.dashboard_view) {
        this.currentContext = this.contextItems.find(item => item.value === params.dashboard_view)!;
      } else {
        this.navigationService.navigate({
          navType: NavigationParamsType.InApp,
          path: [`/custom-dashboards/${DASHBOARD_VIEWS.MY_DASHBOARDS}`]
        });
        this.currentContext = this.contextItems[0];
      }
    });
  }

  public onContextChange(context: ToggleItem<string>): void {
    if (context.hasOwnProperty('value')) {
      this.navigationService.navigate({
        navType: NavigationParamsType.InApp,
        path: [`/custom-dashboards/${context.value}`]
      });
      this.currentContext = context;
    }
  }
}

export enum DASHBOARD_VIEWS {
  MY_DASHBOARDS = 'my-dashboards',
  ALL_DASHBOARDS = 'all-dashboards'
}

export type DashboardViewType = DASHBOARD_VIEWS.MY_DASHBOARDS | DASHBOARD_VIEWS.ALL_DASHBOARDS;
