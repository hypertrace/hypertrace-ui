// tslint:disable-next-line: import-blacklist
import { TableRow } from '../../../components/src/public-api';

export interface DeploymentsResponse {
  payload: {
    service: string;
    deployments: DeploymentsResponseRow[];
  };
  // tslint:disable-next-line: no-any
  errors: any;
  success: boolean;
}

export interface DeploymentsResponseRow extends TableRow {
  type: string;
  commit?: string;
  status: string;
  triggeredBy: string;
  startTime: number;
  endTime: number;
  commitLink: string;
  prDetails: PullRequestDetails[];
}

export interface PullRequestDetails {
  event_id: string;
  application: string;
  pr_link: string;
  pr_title: string;
  author: string;
  jira_id: string;
}
