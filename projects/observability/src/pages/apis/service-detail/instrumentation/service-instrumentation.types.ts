export interface HeuristicScoreInfo {
  name: string;
  description: string;
  evalTimestamp: string;
  score: number;
  sampleIds: SampleHeuristicEnityId<SAMPLE_HEURISTIC_ENTITY_DELIMETER>[];
  sampleType: 'span' | 'trace';
  sampleSize: string;
  failureCount: string;
}

export interface HeuristicClassScoreInfo {
  name: string;
  score: number;
  description?: string;
  heuristicScoreInfo?: HeuristicScoreInfo[];
}

export interface ServiceScoreResponse {
  serviceName: string;
  bu: string;
  heuristicClassScoreInfo: HeuristicClassScoreInfo[];
  aggregatedWeightedScore: number;
}

export interface OrgScoreResponse {
  heuristicClassScoreInfo: HeuristicClassScoreInfo[];
  aggregatedWeightedScore: number;
}

export type SampleHeuristicEnityId<Delimeter extends string> = `${string}${Delimeter}${string}`;

export type SAMPLE_HEURISTIC_ENTITY_DELIMETER = ':' | ', ';
