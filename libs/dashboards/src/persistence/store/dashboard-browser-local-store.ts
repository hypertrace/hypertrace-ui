import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  DashboardCreationData,
  DashboardStore,
  DashboardUpdateData,
  DashboardUpsertData,
  PersistedDashboard
} from './dashboard-store';

@Injectable({
  providedIn: 'root'
})
export class DashboardBrowserLocalStore implements DashboardStore {
  private static readonly DASHBOARD_STORAGE_KEY: string = 'hypertrace-dashboards';

  private allDashboards: { [key: string]: PersistedDashboard } = {};

  public read(id: string): Observable<PersistedDashboard> {
    this.syncMemoryFromBrowserStorage();
    if (id in this.allDashboards) {
      return of(this.allDashboards[id]);
    }

    return throwError(`Provided ID does not exist: ${id}`);
  }

  public readAll(): Observable<PersistedDashboard> {
    this.syncMemoryFromBrowserStorage();

    return of(...Object.values(this.allDashboards));
  }

  public create(content: DashboardCreationData): Observable<PersistedDashboard> {
    this.syncMemoryFromBrowserStorage();

    const fullDashboard = {
      id: this.generateId(),
      ...content,
      version: 1
    };

    this.allDashboards[fullDashboard.id] = fullDashboard;
    this.syncBrowserStorageFromMemory();

    return of(fullDashboard);
  }

  public update(dashboard: DashboardUpdateData): Observable<PersistedDashboard> {
    this.syncMemoryFromBrowserStorage();
    const existingDashboard = this.allDashboards[dashboard.id];

    // tslint:disable-next-line: strict-boolean-expressions
    if (!existingDashboard) {
      return throwError(`Provided ID does not exist: ${dashboard.id}`);
    }

    const updatedDashboard = {
      ...existingDashboard,
      ...dashboard
    };

    this.allDashboards[dashboard.id] = updatedDashboard;
    this.syncBrowserStorageFromMemory();

    return of(updatedDashboard);
  }

  public delete(id: string): Observable<void> {
    this.syncMemoryFromBrowserStorage();
    if (id in this.allDashboards) {
      // tslint:disable-next-line: no-dynamic-delete
      delete this.allDashboards[id];
      this.syncBrowserStorageFromMemory();

      return of(undefined);
    }

    return throwError(`Provided ID does not exist: ${id}`);
  }

  public upsert(dashboard: DashboardUpsertData): Observable<PersistedDashboard> {
    this.syncMemoryFromBrowserStorage();

    return dashboard.id in this.allDashboards ? this.update(dashboard) : this.create(dashboard);
  }

  private syncBrowserStorageFromMemory(): void {
    const existingDashboardsAsString = JSON.stringify(this.allDashboards);
    localStorage.setItem(DashboardBrowserLocalStore.DASHBOARD_STORAGE_KEY, existingDashboardsAsString);
  }

  private syncMemoryFromBrowserStorage(): void {
    const existingDashboardsAsString = localStorage.getItem(DashboardBrowserLocalStore.DASHBOARD_STORAGE_KEY);
    this.allDashboards = existingDashboardsAsString === null ? {} : JSON.parse(existingDashboardsAsString);
  }

  private generateId(): string {
    return uuidv4();
  }
}
