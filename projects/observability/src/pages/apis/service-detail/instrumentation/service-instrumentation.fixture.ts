import { OrgScoreResponse, ServiceScoreResponse } from './service-instrumentation.types';

export const serviceScoreResponse: ServiceScoreResponse = {
  serviceName: 'metro',
  bu: 'Platform',
  qoiTypeScores: [
    {
      qoiType: 'Quality',
      score: 22.5,
      description: 'Trace quality refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasMeaningfulEndpointName',
          evalTimestamp: 1658434128,
          score: 20.0,
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
      score: 90.0,
      description: 'Trace Security refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
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
    },
    {
      qoiType: 'Security',
      score: 90.0,
      description: 'Trace Security refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
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
    },
    {
      qoiType: 'Noise',
      score: 90.0,
      description: 'Trace Security refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
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
      score: 22.5,
      description: 'Trace quality refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
        {
          description: 'Single paragraph description for this heuristic.',
          qoiParam: 'HasMeaningfulEndpointName',
          evalTimestamp: 1658434128,
          score: 20.0,
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
      qoiType: 'Security',
      score: 90.0,
      description: 'Trace Security refers to the quality of the existing metadata in spans/traces.',
      qoiParamScores: [
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
  aggregatedWeightedScore: 40.5
};
