import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NavigationParamsType, NavigationService, UserInfoService, UserTraits } from '@hypertrace/common';
import { ButtonRole, InputAppearance, NotificationService } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { CustomDashboardStoreService, DashboardData, PanelData } from '../custom-dashboard-store.service';
import { CustomDashboardService } from '../custom-dashboard.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./custom-dashboard-detail.component.scss'],
  template: `
    <div class="dashboard-viewer">
      <div class="header-container">
        <ht-input
          type="string"
          class="dashboard-name-input"
          appearance="${InputAppearance.Border}"
          [value]="dashboardName"
          (valueChange)="this.onDashboardNameChange($event)"
        >
        </ht-input>
        <div class="button-container">
          <ht-button
            *ngIf="user.id === this.ownerId"
            class="save-btn"
            [label]="'Save'"
            role="${ButtonRole.Additive}"
            (click)="createOrUpdateDashboard()"
          >
          </ht-button>
          <ht-button [label]="'Cancel'" role="${ButtonRole.Destructive}" (click)="redirectToListing()"> </ht-button>
        </div>
      </div>
      <div class="panels-list" *ngIf="this.panels$ | async as panels">
        <ht-custom-dashboard-panel
          [panel]="panel"
          [isOwner]="user.id === this.ownerId"
          *ngFor="let panel of panels"
          (editPanel)="onPanelEdit($event)"
          (deletePanel)="onPanelDelete($event)"
        >
        </ht-custom-dashboard-panel>
      </div>
      <button *ngIf="user.id === this.ownerId" class="add-panel" (click)="redirectToCreatePanel()">Add Panel +</button>
    </div>
  `
})
export class CustomDashboardDetailComponent {
  public dashboardName: string = 'Unnamed';
  public isNew: boolean = false;
  public dashboardId: string = '';
  public dashboardData!: DashboardData;
  public isUnsaved: boolean = false;
  public queryParams: Params = {};
  public panels$!: Observable<PanelData[]>;
  public user: UserTraits;
  public ownerId?: number;
  public constructor(
    protected readonly navigationService: NavigationService,
    protected readonly customDashboardStoreService: CustomDashboardStoreService,
    protected readonly activedRoute: ActivatedRoute,
    private readonly customDashboardService: CustomDashboardService,
    private readonly notificationService: NotificationService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly userInfoService: UserInfoService
  ) {
    this.activedRoute.params.subscribe(params => {
      this.dashboardId = params.dashboard_id;
      this.isNew = params.dashboard_id === 'create';
    });
    this.activedRoute.queryParams.subscribe(query => {
      this.isUnsaved = query.unSaved;
      this.queryParams = query;
    });
    this.user = this.userInfoService.getUserData();

    if (!this.isNew) {
      // Is not new since redirection back from edit panel page.
      if (this.isUnsaved) {
        this.isNew = this.queryParams.newDashboard === 'true';
        this.dashboardData = this.customDashboardStoreService.get(this.dashboardId);
        this.dashboardName = this.dashboardData.name;
        this.ownerId = this.dashboardData.ownerId;
        this.panels$ = this.customDashboardStoreService.getAllPanels(this.dashboardId);
      }
      // Fetch data from server and set data from server
      else {
        this.customDashboardService.fetchDashboardConfigById(this.dashboardId).subscribe(response => {
          const payload = response.payload;
          this.dashboardData = {
            id: payload.Id,
            name: payload.Data.name,
            panels: payload.Data.panels,
            ownerId: payload.OwnerID
          };
          this.ownerId = payload.OwnerID;
          this.dashboardName = this.dashboardData.name;

          this.customDashboardStoreService.set(this.dashboardId, this.dashboardData);
          this.panels$ = this.customDashboardStoreService.getAllPanels(this.dashboardId);
          this.changeDetectorRef.detectChanges();
        });
      }
    } else {
      // Default new dashboard
      this.dashboardId = this.customDashboardService.convertNameToSlug(this.dashboardName);
      this.dashboardData = {
        id: this.dashboardId,
        name: this.dashboardName,
        panels: [],
        ownerId: this.user.id
      };
      this.ownerId = this.user.id;
      this.customDashboardStoreService.set(this.dashboardId, this.dashboardData);
      this.panels$ = this.customDashboardStoreService.getAllPanels(this.dashboardId);
    }
  }
  public onPanelEdit(panelId: string): void {
    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: [`/custom-dashboards/${this.dashboardId}/panel/${panelId}`],
      queryParams: { dashboardName: this.dashboardName, newDashboard: this.isNew },
      queryParamsHandling: 'merge',
      replaceCurrentHistory: false
    });
  }
  public onPanelDelete(panelData: { panelName: string; panelId: string }): void {
    const confirmation = confirm(`Are you sure to delete ${panelData.panelName} panel?`);
    if (confirmation) {
      this.dashboardData = this.customDashboardStoreService.deletePanel(this.dashboardId, panelData.panelId);
      this.customDashboardStoreService.set(this.dashboardId, this.dashboardData);
      this.panels$ = this.customDashboardStoreService.getAllPanels(this.dashboardId);
    }
  }
  public redirectToCreatePanel(): void {
    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: [`/custom-dashboards/${this.dashboardId}/panel/new`],
      queryParams: { dashboardName: this.dashboardName, newDashboard: this.isNew },
      queryParamsHandling: 'merge',
      replaceCurrentHistory: false
    });
  }
  public redirectToListing(): void {
    const confirmation = confirm(`Your unsaved changes will be lost! Discard them anyways?`);
    if (confirmation) {
      this.navigationService.navigate({
        navType: NavigationParamsType.InApp,
        path: [`/custom-dashboards`],
        queryParams: { dashboardName: this.dashboardName, newDashboard: this.isNew },
        queryParamsHandling: 'merge',
        replaceCurrentHistory: false
      });
    }
  }
  public onDashboardNameChange(name: string): void {
    this.dashboardName = name;
    this.dashboardData.name = this.dashboardName;
    this.customDashboardStoreService.set(this.dashboardId, this.dashboardData);
  }
  public createOrUpdateDashboard(): void {
    this.dashboardData.id = this.customDashboardService.convertNameToSlug(this.dashboardData.name);
    if (this.isNew) {
      // Create
      this.customDashboardService.createDashboard(this.dashboardData).subscribe(() => {
        this.notificationService.createSuccessToast('Dashboard created successfully!');
        this.navigationService.navigate({
          navType: NavigationParamsType.InApp,
          path: ['/custom-dashboards']
        });
      });
    } else {
      // Update
      this.customDashboardService.updateDashboard(this.dashboardId, this.dashboardData).subscribe(() => {
        this.notificationService.createSuccessToast('Dashboard updated successfully!');
        this.navigationService.navigate({
          navType: NavigationParamsType.InApp,
          path: ['/custom-dashboards']
        });
      });
    }
  }
}
