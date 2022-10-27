export interface HeuristicScoreInfo {
  name: string;
  description: string;
  evalTimestamp: string;
  score: number;
  sampleIds: SampleHeuristicEntityId<SAMPLE_HEURISTIC_ENTITY_DELIMITER>[];
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

export type SampleHeuristicEntityId<Delimiter extends string> = `${string}${Delimiter}${string}`;

export type SAMPLE_HEURISTIC_ENTITY_DELIMITER = ':';
