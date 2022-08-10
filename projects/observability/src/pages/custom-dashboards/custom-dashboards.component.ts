import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationParamsType, NavigationService, UserInfoService } from '@hypertrace/common';
import {
  ButtonRole,
  ButtonStyle,
  CoreTableCellRendererType,
  PageEvent,
  TableCellAlignmentType,
  TableColumnConfig,
  TableDataResponse,
  TableDataSource,
  TableMode,
  TableRow,
  TableStyle
} from '@hypertrace/components';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CustomDashboardListResponse,
  CustomDashboardPayload,
  CustomDashboardService,
  DashboardListItem
} from './custom-dashboard.service';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./custom-dashboards.component.scss'],
  template: `
    <div class="custom-dashboards">
      <div class="title">
        <h2>Custom Dashboards</h2>
        <ht-link [paramsOrUrl]="'create'" class="create-dashboard-button">
          <ht-button role="${ButtonRole.Primary}" display="${ButtonStyle.Solid}" label="Create Dashboard"> </ht-button>
        </ht-link>
      </div>
      <ht-search-box
        class="search-box"
        placeholder="Search"
        [debounceTime]="400"
        (valueChange)="this.onSearchChange($event)"
      ></ht-search-box>

      <div class="dashboard-table">
        <ht-table
          [columnConfigs]="this.columnConfigs"
          [data]="this.dataSource"
          [syncWithUrl]="true"
          [pageable]="true"
          [resizable]="false"
          [pageSize]="this.pageSize"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (pageChange)="onPaginationChange($event)"
          mode=${TableMode.Flat}
          display=${TableStyle.FullPage}
        ></ht-table>
      </div>
    </div>
  `
})
export class CustomDashboardListComponent {
  public dataSource?: TableDataSource<CustomDashboardTableRow>;
  public dashboards$!: Observable<CustomDashboardListResponse>;
  public searchText: string = '';
  public pageSize: number = 10;
  public pageIndex: number = 1;
  public columnConfigs: TableColumnConfig[] = [
    {
      id: 'name',
      name: 'name',
      title: 'Name',
      display: CoreTableCellRendererType.Text,
      visible: true,
      width: '100%',
      sortable: false,
      filterable: false,
      onClick: (row: CustomDashboardTableRow, _column) => this.navigateToDashboard(row.id),
      alignment: TableCellAlignmentType.Left
    },
    {
      id: 'createdAt',
      name: 'createdAt',
      title: 'Created At',
      display: CoreTableCellRendererType.Timestamp,
      visible: true,
      width: '100%',
      sortable: false,
      filterable: false,
      alignment: TableCellAlignmentType.Center
    }
  ];

  public constructor(
    private readonly customDashboardService: CustomDashboardService,
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly userInfoService: UserInfoService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.pageSize = params['page-size'] ?? this.pageSize;
      this.pageIndex = params.page ? +params.page + 1 : this.pageIndex;
    });
    this.customDashboardService.fetchUser().subscribe(data => {
      this.userInfoService.updateUserData({ email: data.payload.email, id: data.payload.id });
    });
    this.setupDataSource({ pageSize: this.pageSize, pageIndex: this.pageIndex });
  }

  private setupDataSource(pagination?: PageEvent): void {
    this.dashboards$ = this.customDashboardService.fetchDashboards(this.searchText, pagination).pipe(
      tap(response => {
        const dashboardPayloads = response.payload;
        this.dataSource = {
          getData: (): Observable<TableDataResponse<CustomDashboardTableRow>> =>
            of({
              data: dashboardPayloads.map((dashboardPayload: CustomDashboardPayload) => ({
                ...dashboardPayload.Data,
                id: dashboardPayload.Id,
                createdAt: dashboardPayload.CreatedAt
              })),
              totalCount: this.searchText === '' ? response.totalRecords : dashboardPayloads.length
            }),
          getScope: () => undefined
        };
      })
    );
    this.dashboards$.subscribe(() => this.changeDetectorRef.detectChanges());
  }

  private navigateToDashboard(id: string): void {
    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: [`/custom-dashboards/${id}`]
    });
  }
  public navigateToCreateDashboard(): void {
    this.navigationService.navigateWithinApp(['/create']);
  }
  public onSearchChange(searchText: string): void {
    this.searchText = searchText;
    this.setupDataSource();
  }
  public onPaginationChange(options: PageEvent): void {
    const pageOptions = { ...options };
    // Since HUS page number starts with 1 but ht-paginator has default value set as 0 hence incrementing
    pageOptions.pageIndex += 1;
    this.setupDataSource(pageOptions);
  }
}

interface CustomDashboardTableRow extends TableRow, DashboardListItem {
  id: string;
  name: string;
  createdBy?: number;
  createdAt?: Date;
}
