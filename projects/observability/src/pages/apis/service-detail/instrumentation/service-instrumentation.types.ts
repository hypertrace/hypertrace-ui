interface QoiParamScore {
  description: string;
  qoiParam: string;
  evalTimestamp: number;
  score: number;
  sampleIds: string[];
  sampleSize: number;
  failureCount: number;
}

interface QoiTypeScore {
  qoiType: string;
  score: number;
  description?: string;
  qoiParamScores?: QoiParamScore[];
}

export interface ServiceScoreResponse {
  serviceName: string;
  bu: string;
  qoiTypeScores: QoiTypeScore[];
  aggregatedWeightedScore: number;
}

export interface OrgScoreResponse {
  qoiTypeScores: QoiTypeScore[];
  aggregatedWeightedScore: number;
}
