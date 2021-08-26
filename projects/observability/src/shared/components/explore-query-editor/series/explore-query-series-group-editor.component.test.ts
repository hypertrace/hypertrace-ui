import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { LoggerService, NavigationService } from '@hypertrace/common';
import { SelectModule } from '@hypertrace/components';
import { AttributeMetadata, MetadataService, MetricAggregationType } from '@hypertrace/observability';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { CartesianSeriesVisualizationType } from '../../cartesian/chart';
import { ExploreQuerySeriesEditorComponent } from './explore-query-series-editor.component';
import { ExploreQuerySeriesGroupEditorComponent } from './explore-query-series-group-editor.component';

describe('Explore Query Series Group Editor component', () => {
  // Define metadata at top level so equality checks always get same values
  const attributeMetadata = [
    { name: 'first', allowedAggregations: [MetricAggregationType.Average] },
    { name: 'second', allowedAggregations: [MetricAggregationType.Average] },
    { name: 'modified first', allowedAggregations: [MetricAggregationType.Average] }
  ];

  const hostBuilder = createHostFactory({
    component: ExploreQuerySeriesGroupEditorComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    declarations: [ExploreQuerySeriesEditorComponent],
    providers: [
      mockProvider(LoggerService, {
        warn: jest.fn(() => {
          throw Error();
        })
      }),
      mockProvider(MetadataService, {
        getAttributeDisplayName: (attribute: AttributeMetadata) => attribute.name,
        getSelectionAttributes: () => of(attributeMetadata)
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ],
    shallow: true
  });
  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column
    }
  });

  const matchSeriesWithName = (name: string) =>
    expect.objectContaining({ specification: expect.objectContaining({ name: name }) });

  test('renders multiple series with index indicator', fakeAsync(() => {
    const spectator = hostBuilder(
      `

    <ht-explore-query-series-group-editor [series]="series" context="${ObservabilityTraceType.Api}">
    </ht-explore-query-series-group-editor>`,
      {
        hostProps: {
          series: [buildSeries('first'), buildSeries('second')]
        }
      }
    );
    spectator.tick();

    expect(spectator.queryAll('.series-container').length).toBe(2);
    expect(spectator.queryAll('.series-container')[0]).toHaveText('first');
    expect(spectator.queryAll('.series-container')[0]).toHaveText('1');
    expect(spectator.queryAll('.series-container')[1]).toHaveText('second');
    expect(spectator.queryAll('.series-container')[1]).toHaveText('2');
  }));

  test('emits add event on add click', () => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-group-editor [series]="series" context="${ObservabilityTraceType.Api}" (addSeries)="onChange()">
    </ht-explore-query-series-group-editor>`,
      {
        hostProps: {
          series: [buildSeries('first')],
          onChange: onChange
        }
      }
    );

    spectator.click('.add-series-button');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('emits series removal on remove', () => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-group-editor [series]="series" (seriesChange)="onChange($event)">
    </ht-explore-query-series-group-editor>`,
      {
        hostProps: {
          series: [buildSeries('first'), buildSeries('second')],
          onChange: onChange
        }
      }
    );

    spectator.queryAll(ExploreQuerySeriesEditorComponent)[1].onRemove();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([matchSeriesWithName('first')]);
  });

  test('emits series replacement on series change', () => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-series-group-editor [series]="series" (seriesChange)="onChange($event)">
    </ht-explore-query-series-group-editor>`,
      {
        hostProps: {
          series: [buildSeries('first'), buildSeries('second')],
          onChange: onChange
        }
      }
    );

    spectator.queryAll(ExploreQuerySeriesEditorComponent)[0].seriesChange.emit(buildSeries('modified first'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([matchSeriesWithName('modified first'), matchSeriesWithName('second')]);
  });
});
