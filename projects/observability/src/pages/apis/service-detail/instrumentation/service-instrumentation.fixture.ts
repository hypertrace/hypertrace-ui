import { OrgScoreResponse, ServiceScoreResponse } from './service-instrumentation.types';

export const serviceScoreResponse: ServiceScoreResponse = {
  serviceName: 'metro',
  bu: 'Platform',
  qoiTypeScores: [
    {
      qoiType: 'Quality',
      score: 52.5,
      description: 'Trace quality refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasMeaningfulEndpointName',
          evalTimestamp: 1658434128,
          score: 70.0,
          sampleIds: ['5dea74f41f728fd91c7', '5dea74asdas1'],
          sampleSize: 1000,
          failureCount: 200
        },
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasUniqueClientSpans',
          evalTimestamp: 1658434286,
          score: 25.0,
          sampleIds: ['95ea74f41f728fd91c7', 'asddea74asdas1'],
          sampleSize: 1000,
          failureCount: 250
        }
      ]
    },
    {
      qoiType: 'Completeness',
      score: 30.0,
      description: 'Trace completeness refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 60.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        }
      ]
    },
    {
      qoiType: 'Security',
      score: 70.0,
      description: 'Trace security refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 90.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        },
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 90.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        },
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 30.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        }
      ]
    },
    {
      qoiType: 'Noise',
      score: 90.0,
      description: 'Trace noise refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 90.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        },
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasNoTokens',
          evalTimestamp: 1658434128,
          score: 90.0,
          sampleIds: ['m5dea7728fd91c7', 'n1235dea74asdas1'],
          sampleSize: 100,
          failureCount: 90
        }
      ]
    }
  ],
  aggregatedWeightedScore: 60.5
};

export const orgScoreResponse: OrgScoreResponse = {
  qoiTypeScores: [
    {
      qoiType: 'Quality',
      score: 72.5
    },
    {
      qoiType: 'Completeness',
      score: 50.0
    },
    {
      qoiType: 'Security',
      score: 82.5
    },
    {
      qoiType: 'Noise',
      score: 32.5
    }
  ],
  aggregatedWeightedScore: 40.5
};
