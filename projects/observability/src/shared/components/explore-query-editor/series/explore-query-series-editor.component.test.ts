import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { SelectComponent, SelectModule } from '@hypertrace/components';
import {
  AttributeMetadata,
  getAggregationDisplayName,
  MetadataService,
  MetricAggregationType
} from '@hypertrace/distributed-tracing';
import { byText, createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { CartesianSeriesVisualizationType } from '../../cartesian/chart';
import { ExploreQuerySeriesEditorComponent } from './explore-query-series-editor.component';

describe('Explore Query Series Editor component', () => {
  // Define metadata at top level so equality checks always get same values
  const attributeMetadata = jest.fn();

  const hostBuilder = createHostFactory({
    component: ExploreQuerySeriesEditorComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(MetadataService, {
        getAttributeDisplayName: (attribute: AttributeMetadata) => attribute.name,
        getSelectionAttributes: jest.fn(() => of(attributeMetadata()))
      }),
      mockProvider(NavigationService)
    ],
    shallow: true
  });
  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column
    }
  });

  beforeEach(() => {
    attributeMetadata.mockReset();
    attributeMetadata.mockReturnValue([
      { name: 'test value', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] },
      { name: 'foo bar', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] }
    ]);
  });
  test('updates on series change', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value')
        }
      }
    );
    spectator.tick();
    expect(spectator.element).toHaveText('test value');

    spectator.setHostInput({ series: buildSeries('foo bar') });
    expect(spectator.element).toHaveText('foo bar');
  }));

  test('shows remove button only if removable', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" [removable]="removable">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          removable: false,
          series: buildSeries('test value')
        }
      }
    );

    expect(spectator.query('.series-remove-button')).not.toExist();

    spectator.setHostInput({ removable: true });
    expect(spectator.query('.series-remove-button')).toExist();
  });

  test('notifies on remove', () => {
    const onRemove = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" [removable]="removable" (removed)="onRemove()">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          removable: true,
          series: buildSeries('test value'),
          onRemove: onRemove
        }
      }
    );

    spectator.click('.series-remove-button');
    expect(onRemove).toHaveBeenCalled();
  });

  test('displays all attribute options', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value')
        }
      }
    );

    spectator.tick();
    spectator.click(spectator.query(byText('test value'))!);
    const options = spectator.queryAll('.select-option', { root: true });

    expect(options.length).toBe(2);
    expect(options[0]).toHaveText('test value');
    expect(options[1]).toHaveText('foo bar');
  }));

  test('displays aggregation options based on attribute selection', fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test value',
        allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Min, MetricAggregationType.Sum]
      },
      {
        name: 'foo bar'
      }
    ]);

    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Average)
        }
      }
    );

    spectator.tick();

    spectator.click(spectator.query(byText(getAggregationDisplayName(MetricAggregationType.Average)))!);

    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(3);
    expect(options[0]).toHaveText(getAggregationDisplayName(MetricAggregationType.Average));
    expect(options[1]).toHaveText(getAggregationDisplayName(MetricAggregationType.Min));
    expect(options[2]).toHaveText(getAggregationDisplayName(MetricAggregationType.Sum));
  }));

  test('notifies on aggregation change', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}" (seriesChange)="onChange($event)">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Average),
          onChange: onChange
        }
      }
    );

    spectator.tick();

    spectator.click(spectator.query(byText(getAggregationDisplayName(MetricAggregationType.Average)))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'test value',
          aggregation: MetricAggregationType.Max
        })
      })
    );
    flush(); // Overlay closes async
  }));

  test('notifies on attribute change', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}" (seriesChange)="onChange($event)">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Average),
          onChange: onChange
        }
      }
    );

    spectator.tick();

    spectator.click(spectator.query(byText('test value'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'foo bar',
          aggregation: MetricAggregationType.Average
        })
      })
    );
    flush(); // Overlay closes async
  }));

  test("defaults to first aggregation when changing to an attribute that doesn't support existing aggregation", fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test value',
        allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max]
      },
      {
        name: 'foo bar',
        allowedAggregations: [MetricAggregationType.Min, MetricAggregationType.Max]
      }
    ]);

    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}" (seriesChange)="onChange($event)">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Average),
          onChange: onChange
        }
      }
    );

    spectator.tick();

    spectator.click(spectator.query(byText('test value'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'foo bar',
          aggregation: MetricAggregationType.Min
        })
      })
    );

    flush(); // Overlay closes async
  }));

  test('disables aggregation selection when only one available', fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test value',
        allowedAggregations: [MetricAggregationType.Sum]
      },
      {
        name: 'foo bar'
      }
    ]);

    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Sum)
        }
      }
    );

    spectator.tick();

    expect(spectator.query(byText(getAggregationDisplayName(MetricAggregationType.Sum)))).toExist();
    expect(spectator.query('.aggregation-selector', { read: SelectComponent })!.disabled).toBe(true);
  }));

  test('notifies on series visualization type change', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}" (seriesChange)="onChange($event)">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test value', MetricAggregationType.Average),
          onChange: onChange
        }
      }
    );

    spectator.tick();

    spectator.click(spectator.query(byText('Column'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        visualizationOptions: expect.objectContaining({
          type: CartesianSeriesVisualizationType.Area
        })
      })
    );
    flush(); // Overlay closes async
  }));
});
