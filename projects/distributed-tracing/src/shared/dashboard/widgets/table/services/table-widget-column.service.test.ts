import { fakeAsync } from '@angular/core/testing';
import { FilterBuilderLookupService } from '@hypertrace/components';
import {
  MetadataService,
  SpecificationBackedTableColumnDef,
  SpecificationBuilder
} from '@hypertrace/distributed-tracing';
import { getAllTestFilterAttributes, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { TableWidgetColumnsService } from './table-widget-columns.service';

describe('Table Widget Column service', () => {
  const existingColumns: SpecificationBackedTableColumnDef[] = [
    {
      id: 'stringAttribute',
      name: 'stringAttribute',
      specification: new SpecificationBuilder().attributeSpecificationForKey('stringAttribute')
    }
  ];

  const createService = createServiceFactory({
    service: TableWidgetColumnsService,
    providers: [
      mockProvider(MetadataService, {
        getSelectionAttributes: () => of(getAllTestFilterAttributes())
      }),
      FilterBuilderLookupService
    ]
  });

  test('should fetch attributes and map supported attributes to columns', fakeAsync(() => {
    const spectator = createService();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fetchColumn('TEST_SCOPE', existingColumns)).toBe('(x|)', {
        x: [
          {
            // This was the existing column
            id: 'stringAttribute',
            name: 'stringAttribute',
            specification: expect.objectContaining({
              name: 'stringAttribute'
            })
          },
          {
            // Fetched columns
            alignment: 'left',
            display: 'text',
            editable: true,
            filterable: true,
            id: 'booleanAttribute',
            name: 'booleanAttribute',
            specification: expect.objectContaining({
              name: 'booleanAttribute'
            }),
            title: 'Boolean Attribute',
            titleTooltip: 'Boolean Attribute',
            visible: false,
            width: '1'
          },
          {
            alignment: 'left',
            display: 'text',
            editable: true,
            filterable: false,
            id: 'stringArrayAttribute',
            name: 'stringArrayAttribute',
            specification: expect.objectContaining({
              name: 'stringArrayAttribute'
            }),
            title: 'String Array Attribute',
            titleTooltip: 'String Array Attribute',
            visible: false,
            width: '1'
          },
          {
            alignment: 'left',
            display: 'text',
            editable: true,
            filterable: true,
            id: 'stringMapAttribute',
            name: 'stringMapAttribute',
            specification: expect.objectContaining({
              name: 'stringMapAttribute'
            }),
            title: 'String Map Attribute',
            titleTooltip: 'String Map Attribute',
            visible: false,
            width: '1'
          },
          {
            alignment: 'right',
            display: 'timestamp',
            editable: true,
            filterable: false,
            id: 'timestampAttribute',
            name: 'timestampAttribute',
            specification: expect.objectContaining({
              name: 'timestampAttribute'
            }),
            title: 'Timestamp Attribute',
            titleTooltip: 'Timestamp Attribute',
            visible: false,
            width: '1'
          }
        ]
      });
    });
  }));
});
