// tslint:disable: max-file-line-count
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Renderer2 } from '@angular/core';
import { discardPeriodicTasks, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { IconLibraryTestingModule, IconRegistryService } from '@hypertrace/assets-library';
import { DomElementMeasurerService, selector } from '@hypertrace/common';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { MetricAggregationType, MetricHealth } from '@hypertrace/distributed-tracing';
import { addWidthAndHeightToSvgElForTest } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { uniq } from 'lodash-es';
import { of } from 'rxjs';
import { TopologyNodeRendererService } from '../../../components/topology/renderers/node/topology-node-renderer.service';
import { D3UtilService } from '../../../components/utils/d3/d3-util.service';
import { EntityMetadata, ENTITY_METADATA } from '../../../constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../graphql/model/schema/entity';
import { ErrorPercentageMetricValueCategory } from '../../../graphql/model/schema/specifications/error-percentage-aggregation-specification';
import { PercentileLatencyMetricValueCategory } from '../../../graphql/model/schema/specifications/percentile-latency-aggregation-specification';
import { ObservabilitySpecificationBuilder } from '../../../graphql/request/builders/selections/observability-specification-builder';
import {
  EntityEdge,
  EntityNode
} from '../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { ObservabilityIconLibraryModule } from '../../../icons/observability-icon-library.module';
import { ObservabilityIconType } from '../../../icons/observability-icon-type';
import { BackendNodeBoxRendererService } from './node/box/backend-node-renderer/backend-node-box-renderer.service';
import { TopologyWidgetRendererComponent } from './topology-widget-renderer.component';
import { TopologyWidgetModule } from './topology-widget.module';

describe('Topology Widget renderer', () => {
  let mockResponse: EntityNode[] = [];
  const specBuilder = new ObservabilitySpecificationBuilder();
  const nodeSpec = {
    titleSpecification: specBuilder.attributeSpecificationForKey('name'),
    metricSpecifications: [
      specBuilder.metricAggregationSpecForKey('metric1', MetricAggregationType.Average),
      specBuilder.metricAggregationSpecForKey('metric2', MetricAggregationType.Max),
      specBuilder.metricAggregationSpecForLatency(MetricAggregationType.P99, 'p99Latency'),
      specBuilder.metricAggregationSpecForErrorPercentage(MetricAggregationType.Average)
    ]
  };
  const edgeSpec = {
    metricSpecifications: [
      specBuilder.metricAggregationSpecForKey('metric3', MetricAggregationType.Sum),
      specBuilder.metricAggregationSpecForKey('metric4', MetricAggregationType.Min),
      specBuilder.metricAggregationSpecForLatency(MetricAggregationType.P99, 'p99Latency'),
      specBuilder.metricAggregationSpecForErrorPercentage(MetricAggregationType.Average)
    ]
  };

  const findNodeWithTypeAndName = (
    spectator: Spectator<unknown>,
    type: ObservabilityEntityType,
    name: string
  ): Element => {
    const dataGElement = spectator.element.querySelector('.topology-data')!;
    const node = Array.from(dataGElement.querySelectorAll(selector(type.toLowerCase()))).find(element => {
      const label = element.querySelector('.entity-label');

      return label && label.textContent && label.textContent.trim() === name;
    });
    expect(node).toBeDefined();

    return node!;
  };

  const findEdgeWithMetricValue = (spectator: Spectator<unknown>, value: string | number): Element => {
    const node = Array.from(spectator.element.querySelectorAll('.entity-edge')).find(element => {
      const nodeValue = element.querySelector('.entity-edge-metric-value');

      return nodeValue && nodeValue.textContent && nodeValue.textContent.trim() === String(value);
    });
    expect(node).toBeDefined();

    return node!;
  };

  const mockModel = {
    getData: jest.fn(() =>
      of({
        nodes: mockResponse,
        nodeSpecification: nodeSpec,
        edgeSpecification: edgeSpec,
        nodeTypes: uniq(mockResponse.map(node => node.data[entityTypeKey]))
      })
    ),
    showLegend: true
  };

  const createComponent = createComponentFactory<TopologyWidgetRendererComponent>({
    component: TopologyWidgetRendererComponent,
    providers: [
      ...mockDashboardWidgetProviders(mockModel),
      mockProvider(DomElementMeasurerService, {
        measureSvgElement: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }),
        getComputedTextLength: () => 0
      }),
      {
        provide: ENTITY_METADATA,
        useValue: new Map<string, EntityMetadata>([
          [
            ObservabilityEntityType.Api,
            {
              entityType: ObservabilityEntityType.Api,
              icon: ObservabilityIconType.Api,
              detailPath: (id: string) => ['application', 'api', id]
            }
          ],
          [
            ObservabilityEntityType.Service,
            {
              entityType: ObservabilityEntityType.Service,
              icon: ObservabilityIconType.Service,
              detailPath: (id: string) => ['services', 'service', id],
              listPath: ['services']
            }
          ],
          [
            ObservabilityEntityType.Backend,
            {
              entityType: ObservabilityEntityType.Backend,
              icon: ObservabilityIconType.Backend,
              detailPath: (id: string) => ['backends', 'backend', id],
              listPath: ['backends']
            }
          ]
        ])
      }
    ],
    declareComponent: false,
    imports: [TopologyWidgetModule, ObservabilityIconLibraryModule, HttpClientTestingModule, IconLibraryTestingModule]
  });

  beforeEach(() => {
    const utilService: D3UtilService = TestBed.inject(D3UtilService);
    utilService.createDetached = jest.fn((renderer: Renderer2, tag: string, namespace?: string) => {
      const el = renderer.createElement(tag, namespace);
      addWidthAndHeightToSvgElForTest(el, 100, 100);

      return el;
    });
  });

  test('renders a topology with multiple node types', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'avg(metric1)': {
            value: 123,
            health: MetricHealth.Healthy
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Api,
          name: 'Api 2',
          'avg(metric1)': {
            value: 456,
            health: MetricHealth.Warning
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '3',
          [entityTypeKey]: ObservabilityEntityType.Backend,
          name: 'Backend 3'
        },
        specification: nodeSpec
      }
    ];
    const spectator = createComponent();

    spectator.tick();
    // Can't use normal angular querying against d3
    const serviceNode = spectator.element.querySelector('.service')!;
    const apiNode = spectator.element.querySelector('.api')!;
    expect(serviceNode.textContent).toContain('Service 1');
    expect(serviceNode.querySelector('.metric-category')).toExist();
    expect(serviceNode.querySelector('.node-icon')).toExist();
    expect(serviceNode.querySelector('.entity-outer-band')).toExist();

    expect(apiNode.textContent).toContain('Api 2');
    expect(apiNode.querySelector('.metric-category')).toExist();
    expect(apiNode.querySelector('.node-icon')).toExist();
    expect(apiNode.querySelector('.entity-outer-band')).toExist();

    discardPeriodicTasks(); // D3 uses an interval for layout but also cancels it async - discard rather than arbitrarily tick forward in time
  }));

  test('renders a topology with an edge', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      }
    ];

    const edge: EntityEdge = {
      fromNode: mockResponse[0],
      toNode: mockResponse[1],
      data: {
        'p99(duration)': {
          value: 123,
          health: MetricHealth.NotSpecified
        },
        'avg(errorCount)_avg(numCalls)': {
          value: 234,
          health: MetricHealth.NotSpecified,
          category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
        },
        'sum(metric3)': {
          value: 345,
          health: MetricHealth.NotSpecified
        },
        'min(metric4)': {
          value: 456,
          health: MetricHealth.NotSpecified
        }
      },
      specification: edgeSpec
    };
    mockResponse[0].edges.push(edge);
    mockResponse[1].edges.push(edge);

    const spectator = createComponent();
    spectator.tick();
    const dataGElement = spectator.element.querySelector('.topology-data');
    // Can't use normal angular querying against svgs
    expect(dataGElement!.querySelectorAll('.service').length).toBe(2);
    const edgeElements = dataGElement!.querySelectorAll('.entity-edge');
    expect(edgeElements.length).toBe(1);

    expect(edgeElements[0].textContent).toContain('234');
    discardPeriodicTasks(); // D3 uses an interval for layout but also cancels it async - discard rather than arbitrarily tick forward in time
  }));

  test('emphasizes connected neighborhood on node or edge hover', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '3',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 3',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'avg(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      }
    ];

    const edge0To1: EntityEdge = {
      fromNode: mockResponse[0],
      toNode: mockResponse[1],
      data: {
        'p99(duration)': {
          value: 0,
          health: MetricHealth.NotSpecified
        },
        'avg(errorCount)_avg(numCalls)': {
          value: 234,
          health: MetricHealth.NotSpecified,
          category: ErrorPercentageMetricValueCategory.LessThan5
        },
        'sum(metric3)': {
          value: 345,
          health: MetricHealth.NotSpecified
        },
        'min(metric4)': {
          value: 456,
          health: MetricHealth.NotSpecified
        }
      },
      specification: edgeSpec
    };
    mockResponse[0].edges.push(edge0To1);
    mockResponse[1].edges.push(edge0To1);

    const edge1To2: EntityEdge = {
      fromNode: mockResponse[1],
      toNode: mockResponse[2],
      data: {
        'p99(duration)': {
          value: 1,
          health: MetricHealth.NotSpecified
        },
        'avg(errorCount)_avg(numCalls)': {
          value: 234,
          health: MetricHealth.NotSpecified,
          category: ErrorPercentageMetricValueCategory.LessThan5
        },
        'sum(metric3)': {
          value: 345,
          health: MetricHealth.NotSpecified
        },
        'min(metric4)': {
          value: 456,
          health: MetricHealth.NotSpecified
        }
      },
      specification: edgeSpec
    };

    mockResponse[1].edges.push(edge1To2);
    mockResponse[2].edges.push(edge1To2);

    const spectator = createComponent();
    spectator.tick();
    // Can't use normal angular querying against svgs

    const getService = findNodeWithTypeAndName.bind(undefined, spectator, ObservabilityEntityType.Service);
    const getEdge = findEdgeWithMetricValue.bind(undefined, spectator);
    spectator.dispatchMouseEvent(getService('Service 1'), 'mouseenter');
    spectator.tick(); // Should trigger Immediately
    expect(getService('Service 1')).toHaveClass('focused');
    expect(getEdge(0)).toHaveClass('emphasized');
    expect(getService('Service 2')).toHaveClass('emphasized');
    expect(getEdge(1)).toHaveClass('background');
    expect(getService('Service 3')).toHaveClass('background');
    // End hover, classes should update immediately
    spectator.dispatchMouseEvent(getService('Service 1'), 'mouseleave');
    expect(getService('Service 1')).not.toHaveClass('focused');
    expect(getEdge(0)).not.toHaveClass('emphasized');
    expect(getService('Service 2')).not.toHaveClass('emphasized');
    expect(getEdge(1)).not.toHaveClass('background');
    expect(getService('Service 3')).not.toHaveClass('background');

    // Edge hover:
    spectator.dispatchMouseEvent(getEdge(1), 'mouseenter');
    spectator.tick(); // Should trigger
    expect(getService('Service 1')).toHaveClass('background');
    expect(getEdge(0)).toHaveClass('background');
    expect(getService('Service 2')).toHaveClass('emphasized');
    expect(getEdge(1)).toHaveClass('emphasized');
    expect(getService('Service 3')).toHaveClass('emphasized');

    spectator.dispatchMouseEvent(getEdge(1), 'mouseleave');
    expect(getService('Service 1')).not.toHaveClass('background');
    expect(getEdge(0)).not.toHaveClass('background');
    expect(getService('Service 2')).not.toHaveClass('emphasized');
    expect(getEdge(1)).not.toHaveClass('emphasized');
    expect(getService('Service 3')).not.toHaveClass('emphasized');

    // No flush should be needed, no timers should remain active
  }));

  test('displays tooltip on node or edge hover', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'p99(duration)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 456,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 567,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 789,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      }
    ];

    const edge0To1: EntityEdge = {
      fromNode: mockResponse[0],
      toNode: mockResponse[1],
      data: {
        'p99(duration)': {
          value: 321,
          health: MetricHealth.NotSpecified
        },
        'avg(errorCount)_avg(numCalls)': {
          value: 234,
          health: MetricHealth.NotSpecified,
          category: ErrorPercentageMetricValueCategory.LessThan5
        },
        'sum(metric3)': {
          value: 345,
          health: MetricHealth.NotSpecified
        },
        'min(metric4)': {
          value: 456,
          health: MetricHealth.NotSpecified
        }
      },
      specification: edgeSpec
    };
    mockResponse[0].edges.push(edge0To1);
    mockResponse[1].edges.push(edge0To1);

    const spectator = createComponent();
    spectator.tick();
    // Can't use normal angular querying against svgs

    const getService = findNodeWithTypeAndName.bind(undefined, spectator, ObservabilityEntityType.Service, 'Service 1');
    const getEdge = findEdgeWithMetricValue.bind(undefined, spectator, 321);

    spectator.dispatchMouseEvent(getService(), 'mouseenter');
    spectator.tick(500); // Trigger popup
    let container = spectator.query('.tooltip-container', { root: true })!;
    expect(container).toExist();

    expect(container).toHaveDescendantWithText({
      selector: '.tooltip-title',
      text: 'Service 1'
    });
    let metricRowElements = container.querySelectorAll('.metric-row');

    expect(metricRowElements.length).toBe(4);
    expect(metricRowElements[0].querySelector('.metric-label')).toContainText('Metric1');
    expect(metricRowElements[0].querySelector('.metric-value')).toContainText('345');

    expect(metricRowElements[1].querySelector('.metric-label')).toContainText('Max. Metric2');
    expect(metricRowElements[1].querySelector('.metric-value')).toContainText('456');

    spectator.dispatchMouseEvent(getService(), 'mouseleave');
    expect(spectator.query('.tooltip-container', { root: true })).not.toExist();

    spectator.dispatchMouseEvent(getEdge(), 'mouseenter');
    spectator.tick(500); // Trigger popup
    container = spectator.query('.tooltip-container', { root: true })!;
    expect(container).toExist();
    expect(container).toHaveDescendantWithText({
      selector: '.tooltip-title',
      text: `Service 1Service 2`
    });
    metricRowElements = container.querySelectorAll('.metric-row');
    expect(metricRowElements[0].querySelector('.metric-label')).toContainText('Sum Metric3');
    expect(metricRowElements[0].querySelector('.metric-value')).toContainText('345');

    expect(metricRowElements[1].querySelector('.metric-label')).toContainText('Min. Metric4');
    expect(metricRowElements[1].querySelector('.metric-value')).toContainText('456');

    spectator.dispatchMouseEvent(getEdge(), 'mouseleave');
    expect(spectator.query('.tooltip-container', { root: true })).not.toExist();
  }));

  test('displays tooltip and emphasizes on node or edge click', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      }
    ];

    const edge: EntityEdge = {
      fromNode: mockResponse[0],
      toNode: mockResponse[1],
      data: {
        'p99(duration)': {
          value: 123,
          health: MetricHealth.NotSpecified
        },
        'avg(errorCount)_avg(numCalls)': {
          value: 234,
          health: MetricHealth.NotSpecified,
          category: ErrorPercentageMetricValueCategory.LessThan5
        },
        'sum(metric3)': {
          value: 345,
          health: MetricHealth.NotSpecified
        },
        'min(metric4)': {
          value: 456,
          health: MetricHealth.NotSpecified
        }
      },
      specification: edgeSpec
    };
    mockResponse[0].edges.push(edge);
    mockResponse[1].edges.push(edge);

    const spectator = createComponent();
    spectator.tick();
    // Can't use normal angular querying against svgs

    const getService = findNodeWithTypeAndName.bind(undefined, spectator, ObservabilityEntityType.Service, 'Service 1');
    const getEdge = findEdgeWithMetricValue.bind(undefined, spectator, 123);
    const getCloseButton = () => spectator.query('.hide-tooltip-button', { root: true })!;
    const getTooltip = () => spectator.query('.tooltip-container', { root: true })!;

    spectator.dispatchMouseEvent(getService(), 'click');
    spectator.tick();
    expect(getTooltip()).toExist();
    expect(getService()).toHaveClass('focused');
    expect(getEdge()).toHaveClass('emphasized');
    expect(getCloseButton()).toExist();
    spectator.click(getCloseButton());
    expect(getTooltip()).not.toExist();
    expect(getService()).not.toHaveClass('focused');
    expect(getEdge()).not.toHaveClass('emphasized');

    spectator.dispatchMouseEvent(getEdge(), 'click');
    expect(getTooltip()).toExist();
    expect(getService()).toHaveClass('emphasized');
    expect(getEdge()).toHaveClass('emphasized');
    expect(getCloseButton()).toExist();
    spectator.click(getCloseButton());
    expect(getTooltip()).not.toExist();
    expect(getService()).not.toHaveClass('emphasized');
    expect(getEdge()).not.toHaveClass('emphasized');
    flush(); // Overlay detach has a timer that needs to be flushed
  }));

  test('displays legend on node or edge hover', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'p99(duration)': {
            value: 123,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 345,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 456,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'p99(duration)': {
            value: 234,
            health: MetricHealth.NotSpecified,
            category: PercentileLatencyMetricValueCategory.From100To500
          },
          'avg(errorCount)_avg(numCalls)': {
            value: 456,
            health: MetricHealth.NotSpecified,
            category: ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5
          },
          'avg(metric1)': {
            value: 567,
            health: MetricHealth.NotSpecified
          },
          'max(metric2)': {
            value: 789,
            health: MetricHealth.NotSpecified
          }
        },
        specification: nodeSpec
      }
    ];

    const spectator = createComponent();
    spectator.tick();
    expect(spectator.query('.legend .latency')).toExist();
    expect(spectator.query('.legend .error-percentage')).toExist();
  }));

  test('adds dragging class to node while being dragged', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 1',
          'avg(metric1)': {
            value: 123,
            health: MetricHealth.Healthy
          }
        },
        specification: nodeSpec
      },
      {
        edges: [],
        data: {
          [entityIdKey]: '2',
          [entityTypeKey]: ObservabilityEntityType.Service,
          name: 'Service 2',
          'avg(metric1)': {
            value: 456,
            health: MetricHealth.Warning
          }
        },
        specification: nodeSpec
      }
    ];

    const edge: EntityEdge = {
      fromNode: mockResponse[0],
      toNode: mockResponse[1],
      data: {
        'sum(metric3)': {
          value: 789,
          health: MetricHealth.Critical
        }
      },
      specification: edgeSpec
    };
    mockResponse[0].edges.push(edge);
    mockResponse[1].edges.push(edge);

    const spectator = createComponent();
    spectator.tick();

    const getService = findNodeWithTypeAndName.bind(undefined, spectator, ObservabilityEntityType.Service);

    spectator.dispatchMouseEvent(getService('Service 1'), 'mousedown');
    expect(getService('Service 1')).toHaveClass('dragging');
    expect(getService('Service 2')).not.toHaveClass('dragging');
    spectator.dispatchMouseEvent(getService('Service 1'), 'mouseup');
    expect(getService('Service 1')).not.toHaveClass('dragging');
  }));

  test('destroys nodes on destruction', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Backend,
          name: 'Backend 1',
          'avg(metric1)': {
            value: 789,
            health: MetricHealth.Critical
          }
        },
        specification: nodeSpec
      }
    ];
    const spectator = createComponent();
    const nodeRendererDestroySpy = spyOn(
      spectator.inject(TopologyNodeRendererService, true),
      'destroyNode'
    ).and.callThrough();

    const backendRendererDestroySpy = spyOn(
      spectator.inject(BackendNodeBoxRendererService, true),
      'destroy'
    ).and.callThrough();

    spectator.tick();
    expect(nodeRendererDestroySpy).not.toHaveBeenCalled();
    expect(backendRendererDestroySpy).not.toHaveBeenCalled();
    spectator.fixture.destroy();
    expect(nodeRendererDestroySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userNode: mockResponse[0]
      })
    );
    expect(backendRendererDestroySpy).toHaveBeenCalledWith(mockResponse[0]);
  }));

  test('shows backend icon', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Backend,
          name: 'Backend 1',
          protocol: 'mysql',
          'avg(metric1)': {
            value: 789,
            health: MetricHealth.Critical
          }
        },
        specification: nodeSpec
      }
    ];
    const spectator = createComponent({});
    const spy = spyOn(spectator.inject(IconRegistryService), 'getIconRenderInfo');
    spy.and.returnValue({
      iconRenderType: 'ligature',
      ligatureText: 'test',
      label: 'test',
      fontSet: 'material-icons-outlined'
    });

    spectator.tick();

    expect(
      findNodeWithTypeAndName(spectator, ObservabilityEntityType.Backend, 'Backend 1').querySelector('.node-icon')
    ).toExist();

    expect(spy).toHaveBeenCalledWith(ObservabilityIconType.Backend);
  }));

  test('applies dragging class to topology on click and drag', fakeAsync(() => {
    mockResponse = [
      {
        edges: [],
        data: {
          [entityIdKey]: '1',
          [entityTypeKey]: ObservabilityEntityType.Backend,
          name: 'Backend 1',
          protocol: 'mysql',
          'avg(metric1)': {
            value: 789,
            health: MetricHealth.Critical
          }
        },
        specification: nodeSpec
      }
    ];

    const spectator = createComponent({});
    spectator.tick();

    const getDataContainer = () => spectator.element.querySelector<SVGElement>('.topology-data')!;
    const getSvg = () => spectator.element.querySelector<SVGSVGElement>('.topology-svg')!;

    expect(getSvg()).not.toHaveClass('dragging');
    // Difficult to measure transform, and always present since we initialize with a zoom to fit

    spectator.dispatchMouseEvent(getDataContainer(), 'mousedown');
    spectator.dispatchMouseEvent(getDataContainer(), 'mousemove');

    expect(getSvg()).toHaveClass('dragging');

    spectator.dispatchMouseEvent(getDataContainer(), 'mouseup');

    expect(getSvg()).not.toHaveClass('dragging');

    flush();
  }));
});
