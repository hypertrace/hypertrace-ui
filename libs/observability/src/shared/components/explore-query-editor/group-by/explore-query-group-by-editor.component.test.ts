import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { InputModule, LetAsyncModule, SelectComponent, SelectModule } from '@hypertrace/components';
import { byText, createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadata, AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { ExploreQueryGroupByEditorComponent } from './explore-query-group-by-editor.component';

describe('Explore Query Group by Editor component', () => {
  // Define metadata at top level so equality checks always get same values
  const attributeMetadata = [
    { name: 'test value', type: AttributeMetadataType.String },
    { name: 'foo bar', type: AttributeMetadataType.String },
    { name: 'test map', type: AttributeMetadataType.StringMap }
  ];
  const hostBuilder = createHostFactory({
    component: ExploreQueryGroupByEditorComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule, LetAsyncModule, InputModule],
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
    const spectator = hostBuilder(`
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression"
  ></ht-explore-query-group-by-editor>
  `);
    spectator.tick();

    expect(spectator.query(SelectComponent)!.selected).toBeUndefined();
    expect(spectator.query('.select')).toHaveText('None');
  }));

  test('sets group by to key if provided', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByExpression: { key: 'test value' }
        }
      }
    );

    expect(spectator.query(SelectComponent)!.selected).toEqual(attributeMetadata[0]);
  });

  test('updates if new group by is provided', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByExpression: { key: 'test value' }
        }
      }
    );

    spectator.setHostInput({ groupByExpression: { key: 'foo bar' } });

    expect(spectator.query(SelectComponent)!.selected).toEqual(attributeMetadata[1]);

    spectator.setHostInput({ groupByExpression: undefined });

    expect(spectator.query(SelectComponent)!.selected).toBeUndefined();
  });

  test('emits when group by key is changed', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression" (groupByExpressionChange)="onChange($event)"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByExpression: { key: 'test value' },
          onChange: onChange
        }
      }
    );
    spectator.tick(); // Needs to tick to interact with select which is async

    spectator.click(spectator.query(byText('test value'))!);

    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(4);
    spectator.click(options[2]);

    spectator.tick(500); // 500ms debounce after group by change
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ key: 'foo bar' });

    flush(); // Overlay removes async
  }));

  test('emits when group by key is changed', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression" (groupByExpressionChange)="onChange($event)"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByExpression: { key: 'test value' },
          onChange: onChange
        }
      }
    );
    spectator.tick(); // Needs to tick to interact with select which is async

    spectator.click(spectator.query(byText('test value'))!);

    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(4);
    spectator.click(options[2]);

    spectator.tick(500); // 500ms debounce after group by change
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ key: 'foo bar' });

    flush(); // Overlay removes async
  }));

  test('shows subpath for map attributes only', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" [groupByExpression]="groupByExpression"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          groupByExpression: { key: 'test value' }
        }
      }
    );
    spectator.tick(); // Needs to tick to interact with select which is async

    expect(spectator.query('.select')).toHaveText('test value');
    expect(spectator.query('.group-by-path-input')).not.toExist();
    spectator.click(spectator.query(byText('test value'))!);
    const options = spectator.queryAll('.select-option', { root: true });
    spectator.click(options[3]);

    expect(spectator.query('.group-by-path-input')).toExist();

    flush(); // Overlay removes async
  }));

  test('outputs map expressions correctly', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-group-by-editor
      context="${ObservabilityTraceType.Api}" (groupByExpressionChange)="onChange($event)"
  ></ht-explore-query-group-by-editor>
  `,
      {
        hostProps: {
          onChange: onChange
        }
      }
    );
    spectator.tick(); // Needs to tick to interact with select which is async
    expect(onChange).not.toHaveBeenCalled();
    spectator.click(spectator.query(byText('None'))!);
    const options = spectator.queryAll('.select-option', { root: true });
    spectator.click(options[3]);
    // Wait for debounce
    spectator.tick(500);
    // Should not emit on switching to map group by, not eligible without a subpath
    expect(onChange).not.toHaveBeenCalled();
    spectator.typeInElement('test.subpath', '.group-by-path-input input');
    expect(onChange).not.toHaveBeenCalled();
    // Wait for debounce
    spectator.tick(500);
    expect(onChange).toHaveBeenCalledWith({ key: 'test map', subpath: 'test.subpath' });
    flush(); // Overlay removes async
  }));
});
