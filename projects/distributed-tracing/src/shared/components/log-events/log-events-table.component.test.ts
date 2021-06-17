import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { TableComponent, TableModule } from '@hypertrace/components';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { LogEventsTableComponent, LogEventsTableViewType } from './log-events-table.component';
import { LogEventsTableModule } from './log-events-table.module';

describe('LogEventsTableComponent', () => {
  let spectator: Spectator<LogEventsTableComponent>;

  const createHost = createHostFactory({
    component: LogEventsTableComponent,
    imports: [LogEventsTableModule, TableModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [
      mockProvider(ActivatedRoute, {
        queryParamMap: EMPTY
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ]
  });

  test('should render data correctly for sheet view', fakeAsync(() => {
    spectator = createHost(
      `<ht-log-events-table [logEvents]="logEvents" [logEventsTableViewType]="logEventsTableViewType" [startTime]="startTime"></ht-log-events-table>`,
      {
        hostProps: {
          logEvents: [
            { attributes: { attr1: 1, attr2: 2 }, summary: 'test', timestamp: '2021-04-30T12:23:57.889149Z' }
          ],
          logEventsTableViewType: LogEventsTableViewType.Condensed,
          startTime: 1619785437887
        }
      }
    );

    expect(spectator.query('.log-events-table')).toExist();
    expect(spectator.query(TableComponent)).toExist();
    expect(spectator.query(TableComponent)!.resizable).toBe(false);
    expect(spectator.query(TableComponent)!.columnConfigs).toMatchObject([
      expect.objectContaining({
        id: 'timestamp'
      }),
      expect.objectContaining({
        id: 'summary'
      })
    ]);
    expect(spectator.query(TableComponent)!.pageable).toBe(true);
    expect(spectator.query(TableComponent)!.detailContent).not.toBeNull();

    runFakeRxjs(({ expectObservable }) => {
      expect(spectator.component.dataSource).toBeDefined();
      expectObservable(spectator.component.dataSource!.getData(undefined!)).toBe('(x|)', {
        x: {
          data: [expect.objectContaining({ summary: 'test' })],
          totalCount: 1
        }
      });

      flush();
    });
  }));
});
