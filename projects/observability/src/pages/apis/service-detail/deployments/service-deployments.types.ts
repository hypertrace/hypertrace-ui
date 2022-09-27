import { TableRow } from '@hypertrace/components';

export interface DeploymentDataRow extends TableRow {
  id: string;
  name: string;
  type: string;
  status: string;
  triggeredBy: string;
  StartTime: number;
  EndTime: number;
  commit?: string;
}

export interface DeploymentsResponse {
  payload: {
    service: string;
    deployments: DeploymentDataRow[];
  };
  // tslint:disable-next-line: no-any
  errors: any;
  success: boolean;
}
