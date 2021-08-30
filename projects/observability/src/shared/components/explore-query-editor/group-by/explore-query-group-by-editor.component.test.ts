import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { SelectComponent, SelectModule } from '@hypertrace/components';
import { byText, createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { ExploreQueryGroupByEditorComponent } from './explore-query-group-by-editor.component';

describe('Explore Query Group by Editor component', () => {
  // Define metadata at top level so equality checks always get same values
  const attributeMetadata = [{ name: 'test value' }, { name: 'foo bar' }];
  const hostBuilder = createHostFactory({
    component: ExploreQueryGroupByEditorComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(MetadataService, {
        getAttributeDisplayName: (attribute: AttributeMetadata) => attribute.name,
        getGroupableAttributes: () => of(attributeMetadata)
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ],
    shallow: true
  });

  test('sets group by to none if undefined provided', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByKey]="groupBy"
  ></ht-explore-query-group-by-editor>
  `
    );
    spectator.tick();

    expect(spectator.query(SelectComponent)!.selected).toBeUndefined();
    expect(spectator.query('.select')).toHaveText('None');
  }));

  test('sets group by to key if provided', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByKey]="groupByKey"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByKey: 'test value'
        }
      }
    );

    expect(spectator.query(SelectComponent)!.selected).toBe('test value');
  });

  test('updates if new group by is provided', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByKey]="groupByKey"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByKey: 'test value'
        }
      }
    );

    spectator.setHostInput({ groupByKey: 'foo bar' });

    expect(spectator.query(SelectComponent)!.selected).toBe('foo bar');

    spectator.setHostInput({ groupByKey: undefined });

    expect(spectator.query(SelectComponent)!.selected).toBeUndefined();
  });

  test('emits when group by key is changed', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByKey]="groupByKey" (groupByKeyChange)="onChange($event)"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByKey: 'test value',
          onChange: onChange
        }
      }
    );
    spectator.tick(); // Needs to tick to interact with select which is async

    spectator.click(spectator.query(byText('test value'))!);

    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(3);
    spectator.click(options[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('foo bar');

    flush(); // Overlay removes async
  }));
});
