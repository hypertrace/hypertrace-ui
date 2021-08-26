import { FixedTimeRange, isEqualIgnoreFunctions } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlTimeRange, MetricAggregationType, MetricHealth } from '@hypertrace/observability';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../../model/schema/entity';
import { GraphQlIntervalUnit } from '../../../../../model/schema/interval/graphql-interval-unit';
import { ObservabilitySpecificationBuilder } from '../../../../builders/selections/observability-specification-builder';
import {
  EntityEdge,
  EntityNode,
  EntityTopologyGraphQlQueryHandlerService,
  ENTITY_TOPOLOGY_GQL_REQUEST,
  GraphQlEntityTopologyRequest,
  TopologyNodeSpecification
} from './entity-topology-graphql-query-handler.service';

// tslint:disable: max-file-line-count
describe('Entity topology graphql query handler', () => {
  const createService = createServiceFactory({ service: EntityTopologyGraphQlQueryHandlerService });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );

  const specBuilder = new ObservabilitySpecificationBuilder();
  const buildTopologyRequest = (): GraphQlEntityTopologyRequest => ({
    requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
    timeRange: testTimeRange,
    rootNodeType: ObservabilityEntityType.Service,
    rootNodeSpecification: {
      titleSpecification: specBuilder.attributeSpecificationForKey('name'),
      metricSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)]
    },
    rootNodeFilters: [],
    rootNodeLimit: 100,
    downstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
      [
        ObservabilityEntityType.Backend,
        {
          titleSpecification: specBuilder.attributeSpecificationForKey('name'),
          metricSpecifications: [
            specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.AvgrateMinute)
          ]
        }
      ],
      [
        ObservabilityEntityType.Service,
        {
          titleSpecification: specBuilder.attributeSpecificationForKey('name'),
          metricSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)]
        }
      ]
    ]),
    upstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
      [
        ObservabilityEntityType.Service,
        {
          titleSpecification: specBuilder.attributeSpecificationForKey('name'),
          metricSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)]
        }
      ]
    ]),
    edgeSpecification: {
      metricSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)]
    }
  });

  // tslint:disable-next-line: no-any Using any here since the actual type isn't exposed
  const buildTopologyResponse = (): any => ({
    results: [
      {
        id: '1',
        name: 'service 1',
        duration: {
          avg: {
            value: 1
          }
        },
        outgoingEdges_BACKEND: {
          results: [
            {
              duration: {
                avg: {
                  value: 2
                }
              },
              neighbor: {
                id: 'a',
                name: 'backend a',
                type: 'mysql',
                numCalls: {
                  avgrate_min: {
                    value: 3
                  }
                }
              }
            }
          ]
        },
        outgoingEdges_SERVICE: {
          results: [
            {
              duration: {
                avg: {
                  value: 4
                }
              },
              neighbor: {
                id: '2',
                name: 'service 2',
                duration: {
                  avg: {
                    value: 5
                  }
                }
              }
            }
          ]
        },
        incomingEdges_SERVICE: {
          results: []
        }
      },
      {
        id: '2',
        name: 'service 2',
        duration: {
          avg: {
            value: 5
          }
        },
        outgoingEdges_BACKEND: {
          results: []
        },
        outgoingEdges_SERVICE: {
          results: [
            {
              duration: {
                avg: {
                  value: 6
                }
              },
              neighbor: {
                id: '3',
                name: 'service 3',
                duration: {
                  avg: {
                    value: 7
                  }
                }
              }
            }
          ]
        },
        incomingEdges_SERVICE: {
          results: [
            {
              duration: {
                avg: {
                  value: 4
                }
              },
              neighbor: {
                id: '1',
                name: 'service 1',
                duration: {
                  avg: {
                    value: 1
                  }
                }
              }
            }
          ]
        }
      },
      {
        id: '3',
        name: 'service 3',
        duration: {
          avg: {
            value: 7
          }
        },
        outgoingEdges_BACKEND: {
          results: [
            {
              duration: {
                avg: {
                  value: 8
                }
              },
              neighbor: {
                id: 'b',
                name: 'backend b',
                type: 'redis',
                numCalls: {
                  avgrate_min: {
                    value: 9
                  }
                }
              }
            }
          ]
        },
        outgoingEdges_SERVICE: {
          results: []
        },
        incomingEdges_SERVICE: {
          results: [
            {
              duration: {
                avg: {
                  value: 6
                }
              },
              neighbor: {
                id: '2',
                name: 'service 2',
                duration: {
                  avg: {
                    value: 5
                  }
                }
              }
            }
          ]
        }
      }
    ]
  });

  test('only matches topology request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildTopologyRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('builds expected request', () => {
    const spectator = createService();
    const request = buildTopologyRequest();

    expect(spectator.service.convertRequest(request)).toEqual({
      path: 'entities',
      arguments: [
        { name: 'scope', value: ObservabilityEntityType.Service },
        { name: 'limit', value: 100 },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'name', arguments: [{ name: 'key', value: 'name' }] },
            {
              path: 'metric',
              alias: 'duration',
              arguments: [{ name: 'key', value: 'duration' }],
              children: [
                {
                  path: 'avg',
                  alias: 'avg',
                  arguments: [],
                  children: [{ path: 'value' }]
                }
              ]
            },
            {
              path: 'outgoingEdges',
              alias: 'outgoingEdges_BACKEND',
              arguments: [{ name: 'neighborType', value: new GraphQlEnumArgument(ObservabilityEntityType.Backend) }],
              children: [
                {
                  path: 'results',
                  children: [
                    {
                      path: 'metric',
                      alias: 'duration',
                      arguments: [{ name: 'key', value: 'duration' }],
                      children: [
                        {
                          path: 'avg',
                          alias: 'avg',
                          arguments: [],
                          children: [{ path: 'value' }]
                        }
                      ]
                    },
                    {
                      path: 'neighbor',
                      children: [
                        { path: 'id' },
                        { path: 'attribute', alias: 'name', arguments: [{ name: 'key', value: 'name' }] },
                        { path: 'attribute', alias: 'type', arguments: [{ name: 'key', value: 'type' }] },
                        {
                          path: 'metric',
                          alias: 'numCalls',
                          arguments: [{ name: 'key', value: 'numCalls' }],
                          children: [
                            {
                              path: 'avgrate',
                              alias: 'avgrate_min',
                              arguments: [
                                { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) },
                                { name: 'size', value: 1 }
                              ],
                              children: [{ path: 'value' }]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              path: 'outgoingEdges',
              alias: 'outgoingEdges_SERVICE',
              arguments: [{ name: 'neighborType', value: new GraphQlEnumArgument(ObservabilityEntityType.Service) }],
              children: [
                {
                  path: 'results',
                  children: [
                    {
                      path: 'metric',
                      alias: 'duration',
                      arguments: [{ name: 'key', value: 'duration' }],
                      children: [
                        {
                          path: 'avg',
                          alias: 'avg',
                          arguments: [],
                          children: [{ path: 'value' }]
                        }
                      ]
                    },
                    {
                      path: 'neighbor',
                      children: [
                        { path: 'id' },
                        { path: 'attribute', alias: 'name', arguments: [{ name: 'key', value: 'name' }] },
                        {
                          path: 'metric',
                          alias: 'duration',
                          arguments: [{ name: 'key', value: 'duration' }],
                          children: [
                            {
                              path: 'avg',
                              alias: 'avg',
                              arguments: [],
                              children: [{ path: 'value' }]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              path: 'incomingEdges',
              alias: 'incomingEdges_SERVICE',
              arguments: [{ name: 'neighborType', value: new GraphQlEnumArgument(ObservabilityEntityType.Service) }],
              children: [
                {
                  path: 'results',
                  children: [
                    {
                      path: 'metric',
                      alias: 'duration',
                      arguments: [{ name: 'key', value: 'duration' }],
                      children: [
                        {
                          path: 'avg',
                          alias: 'avg',
                          arguments: [],
                          children: [{ path: 'value' }]
                        }
                      ]
                    },
                    {
                      path: 'neighbor',
                      children: [
                        { path: 'id' },
                        { path: 'attribute', alias: 'name', arguments: [{ name: 'key', value: 'name' }] },
                        {
                          path: 'metric',
                          alias: 'duration',
                          arguments: [{ name: 'key', value: 'duration' }],
                          children: [
                            {
                              path: 'avg',
                              alias: 'avg',
                              arguments: [],
                              children: [{ path: 'value' }]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  });
  test('correctly parses response', () => {
    const spectator = createService();
    const request = buildTopologyRequest();
    const serverResponse = buildTopologyResponse();

    const serviceNode1: EntityNode = {
      edges: [],
      data: {
        [entityIdKey]: '1',
        [entityTypeKey]: ObservabilityEntityType.Service,
        name: 'service 1',
        'avg(duration)': {
          value: 1,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.rootNodeSpecification
    };

    const serviceNode2: EntityNode = {
      edges: [],
      data: {
        [entityIdKey]: '2',
        [entityTypeKey]: ObservabilityEntityType.Service,
        name: 'service 2',
        'avg(duration)': {
          value: 5,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.rootNodeSpecification
    };

    const serviceNode3: EntityNode = {
      edges: [],
      data: {
        [entityIdKey]: '3',
        [entityTypeKey]: ObservabilityEntityType.Service,
        name: 'service 3',
        'avg(duration)': {
          value: 7,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.rootNodeSpecification
    };

    const backendNodeA: EntityNode = {
      edges: [],
      data: {
        [entityIdKey]: 'a',
        [entityTypeKey]: ObservabilityEntityType.Backend,
        name: 'backend a',
        type: 'mysql',
        'avgrate_min(numCalls)': {
          value: 3,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.downstreamNodeSpecifications.get(ObservabilityEntityType.Backend)!
    };

    const backendNodeB: EntityNode = {
      edges: [],
      data: {
        [entityIdKey]: 'b',
        [entityTypeKey]: ObservabilityEntityType.Backend,
        name: 'backend b',
        type: 'redis',
        'avgrate_min(numCalls)': {
          value: 9,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.downstreamNodeSpecifications.get(ObservabilityEntityType.Backend)!
    };

    const service1toBackendAEdge: EntityEdge = {
      data: {
        'avg(duration)': {
          value: 2,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.edgeSpecification,
      fromNode: serviceNode1,
      toNode: backendNodeA
    };
    serviceNode1.edges.push(service1toBackendAEdge);
    backendNodeA.edges.push(service1toBackendAEdge);

    const service1ToService2Edge: EntityEdge = {
      data: {
        'avg(duration)': {
          value: 4,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.edgeSpecification,
      fromNode: serviceNode1,
      toNode: serviceNode2
    };
    serviceNode1.edges.push(service1ToService2Edge);
    serviceNode2.edges.push(service1ToService2Edge);

    const service2ToService3Edge: EntityEdge = {
      data: {
        'avg(duration)': {
          value: 6,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.edgeSpecification,
      fromNode: serviceNode2,
      toNode: serviceNode3
    };
    serviceNode2.edges.push(service2ToService3Edge);
    serviceNode3.edges.push(service2ToService3Edge);

    const service3ToBackendBEdge: EntityEdge = {
      data: {
        'avg(duration)': {
          value: 8,
          health: MetricHealth.NotSpecified
        }
      },
      specification: request.edgeSpecification,
      fromNode: serviceNode3,
      toNode: backendNodeB
    };
    serviceNode3.edges.push(service3ToBackendBEdge);
    backendNodeB.edges.push(service3ToBackendBEdge);

    const actual = spectator.service.convertResponse(serverResponse, request);
    const expected = [serviceNode1, backendNodeA, serviceNode2, serviceNode3, backendNodeB];
    // Custom equality checking because built in doesn't do well with circular references + functions (which are checked by reference)
    expect(isEqualIgnoreFunctions(actual, expected)).toBe(true);
  });
});
