import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { SelectComponent, SelectModule } from '@hypertrace/components';
import { byText, createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { getAggregationDisplayName, MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { MetadataService } from '../../../services/metadata/metadata.service';
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
        getSelectionAttributes: jest.fn(() => of(attributeMetadata())),
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY,
      }),
    ],
    shallow: true,
  });
  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column,
    },
  });

  beforeEach(() => {
    attributeMetadata.mockReset();
    attributeMetadata.mockReturnValue([
      { name: 'test_value', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] },
      { name: 'foo_bar', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] },
    ]);
  });
  test('updates on series change', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test_value'),
        },
      },
    );
    spectator.tick();
    expect(spectator.element).toHaveText('test_value');

    spectator.setHostInput({ series: buildSeries('foo_bar') });
    expect(spectator.element).toHaveText('foo_bar');
  }));

  test('shows remove button only if removable', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" [removable]="removable">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          removable: false,
          series: buildSeries('test_value'),
        },
      },
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
          series: buildSeries('test_value'),
          onRemove: onRemove,
        },
      },
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
          series: buildSeries('test_value'),
        },
      },
    );

    spectator.tick();
    spectator.click(spectator.query(byText('test_value'))!);
    const options = spectator.queryAll('.select-option', { root: true });

    expect(options.length).toBe(2);
    expect(options[0]).toHaveText('test_value');
    expect(options[1]).toHaveText('foo_bar');
  }));

  test('displays aggregation options based on attribute selection', fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test_value',
        allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Min, MetricAggregationType.Sum],
      },
      {
        name: 'foo_bar',
      },
    ]);

    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test_value', MetricAggregationType.Average),
        },
      },
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
          series: buildSeries('test_value', MetricAggregationType.Average),
          onChange: onChange,
        },
      },
    );

    spectator.tick();

    spectator.click(spectator.query(byText(getAggregationDisplayName(MetricAggregationType.Average)))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'test_value',
          aggregation: MetricAggregationType.Max,
        }),
      }),
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
          series: buildSeries('test_value', MetricAggregationType.Average),
          onChange: onChange,
        },
      },
    );

    spectator.tick();

    spectator.click(spectator.query(byText('test_value'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'foo_bar',
          aggregation: MetricAggregationType.Average,
        }),
      }),
    );
    flush(); // Overlay closes async
  }));

  test("defaults to first aggregation when changing to an attribute that doesn't support existing aggregation", fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test_value',
        allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max],
      },
      {
        name: 'foo_bar',
        allowedAggregations: [MetricAggregationType.Min, MetricAggregationType.Max],
      },
    ]);

    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}" (seriesChange)="onChange($event)">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test_value', MetricAggregationType.Average),
          onChange: onChange,
        },
      },
    );

    spectator.tick();

    spectator.click(spectator.query(byText('test_value'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specification: expect.objectContaining({
          name: 'foo_bar',
          aggregation: MetricAggregationType.Min,
        }),
      }),
    );

    flush(); // Overlay closes async
  }));

  test('disables aggregation selection when only one available', fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test_value',
        allowedAggregations: [MetricAggregationType.Sum],
      },
      {
        name: 'foo_bar',
      },
    ]);

    const spectator = hostBuilder(
      `
    <ht-explore-query-series-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-editor>`,
      {
        hostProps: {
          series: buildSeries('test_value', MetricAggregationType.Sum),
        },
      },
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
          series: buildSeries('test_value', MetricAggregationType.Average),
          onChange: onChange,
        },
      },
    );

    spectator.tick();

    spectator.click(spectator.query(byText('Column'))!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        visualizationOptions: expect.objectContaining({
          type: CartesianSeriesVisualizationType.Area,
        }),
      }),
    );
    flush(); // Overlay closes async
  }));
});
