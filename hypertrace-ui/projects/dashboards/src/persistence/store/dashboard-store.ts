import { ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';

export interface DashboardStore {
  read(id: string): Observable<PersistedDashboard>;
  readAll(): Observable<PersistedDashboard>;
  create(dashboard: DashboardCreationData): Observable<PersistedDashboard>;
  update(dashboard: DashboardUpdateData): Observable<PersistedDashboard>;
  upsert(dashboard: DashboardUpsertData): Observable<PersistedDashboard>;
  delete(id: string): Observable<void>;
}

export interface PersistedDashboard {
  id: string;
  version: number;
  name: string;
  tags: string[];
  content: ModelJson;
}

export type DashboardCreationData = Pick<PersistedDashboard, 'content' | 'name' | 'tags'>;
export type DashboardUpdateData = Pick<PersistedDashboard, 'id'> &
  Partial<Pick<PersistedDashboard, 'content' | 'name' | 'tags'>>;
export type DashboardUpsertData = DashboardCreationData & DashboardUpdateData;
