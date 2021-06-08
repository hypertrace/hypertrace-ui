import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { SpanExitCallsComponent } from './span-exit-calls.component';
import { SpanExitCallsModule } from './span-exit-calls.module';

describe('SpanExitCallsComponent', () => {
  let spectator: Spectator<SpanExitCallsComponent>;

  const createHost = createHostFactory({
    component: SpanExitCallsComponent,
    imports: [SpanExitCallsModule, HttpClientTestingModule, IconLibraryTestingModule],
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

  test('should render data correctly', fakeAsync(() => {
    spectator = createHost(`<ht-span-exit-calls [exitCalls]="exitCalls"></ht-span-exit-calls>`, {
      hostProps: { exitCalls: { 'name 1': '10', 'name 2': '11' } }
    });

    runFakeRxjs(({ expectObservable }) => {
      expect(spectator.component.dataSource).toBeDefined();
      expectObservable(spectator.component.dataSource!.getData(undefined!)).toBe('(x|)', {
        x: {
          data: [
            { name: 'name 1', calls: '10' },
            { name: 'name 2', calls: '11' }
          ],
          totalCount: 2
        }
      });

      flush();
    });
  }));
});
