import { Injectable } from '@angular/core';
import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { ModelJson } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { ExploreRequestState } from '../../public-api';

@Injectable({
  providedIn: 'root'
})
export class CustomDashboardStoreService {
  private readonly dashboards: Map<string, DashboardData> = new Map();
  public set(dashboardId: string, data: DashboardData): void {
    this.dashboards.set(dashboardId, data);
  }
  public hasKey(dashboardId: string): boolean {
    return this.dashboards.has(dashboardId);
  }
  public get(dashboardId: string): DashboardData {
    return this.dashboards.get(dashboardId)!;
  }
  public addPanel(dashboardId: string, panelData: PanelData): void {
    const dashboard = this.dashboards.get(dashboardId)!;
    dashboard.panels.push(panelData);
  }
  public getPanel(dashboardId: string, panelId: string): PanelData | undefined {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      return dashboard.panels.find(p => p.id === panelId) as PanelData;
    }
  }
  public updatePanel(dashboardId: string, panelData: PanelData): void {
    const dashboard = this.dashboards.get(dashboardId)!;

    const panelIndex = dashboard.panels.findIndex(p => p.id === panelData.id);
    dashboard.panels[panelIndex] = panelData;
    this.dashboards.set(dashboardId, dashboard);
  }
  public deletePanel(dashboardId: string, panelId: string): DashboardData {
    const dashboard = this.dashboards.get(dashboardId)!;

    const newPanels = dashboard.panels.filter(p => p.id !== panelId);
    dashboard.panels = newPanels;
    this.dashboards.set(dashboardId, dashboard);

    return dashboard;
  }
  public getAllPanels(dashboardId: string): Observable<PanelData[]> {
    const dashboard = this.dashboards.get(dashboardId)!;

    return of(dashboard.panels);
  }
  public delete(dashboardId: string): void {
    this.dashboards.delete(dashboardId);
  }
}

export interface DashboardData {
  id: string;
  name: string;
  panels: PanelData[];
  ownerId?: number;
}
export interface PanelData extends ExploreRequestState {
  id: string;
  name: string;
  json: ModelJson;
  isRealtime?: boolean;
  interval: PanelInterval | 'AUTO';
}
export interface PanelInterval extends TimeDuration {
  value: number;
  unit: TimeUnit;
}
