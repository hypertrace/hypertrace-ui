import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { ObservabilityEntityType } from '../../../../../model/schema/entity';
import { TopologyEdgeDirection, TopologySpecificationBuilder } from './topology-specification-builder';

describe('Topology Specification Builder', () => {
  const specBuilder = new TopologySpecificationBuilder();

  test('should return correct neighbor specification', () => {
    const specification = specBuilder.buildNeighborSpecification({
      edgeDirection: TopologyEdgeDirection.Incoming,
      nodeSpecifications: [],
      neighborType: ObservabilityEntityType.Api
    });

    // Name
    expect(specification.name).toBe('incomingEdges_API');

    // Result Alias
    expect(specification.resultAlias()).toBe('incomingEdges_API');

    // Graphql Selection
    expect(specification.asGraphQlSelections()).toMatchObject([
      {
        path: TopologyEdgeDirection.Incoming,
        alias: 'incomingEdges_API',
        arguments: [
          {
            name: 'neighborType',
            value: new GraphQlEnumArgument(ObservabilityEntityType.Api)
          }
        ],
        children: [
          {
            path: 'results',
            children: [
              {
                path: 'neighbor',
                children: [{ path: 'id' }]
              }
            ]
          }
        ]
      }
    ]);

    // Extract from server data
    expect(specification.extractFromServerData({})).toBe(undefined);

    // Extract from server data
    expect(specification.asGraphQlOrderByFragment()).toMatchObject({ expression: { key: '' } });
  });
});
