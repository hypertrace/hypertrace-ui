import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { NEVER, of, throwError } from 'rxjs';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { SpinnerComponent } from './spinner.component';

describe('Spinner component', () => {
  let spectator: Spectator<SpinnerComponent>;

  const createHost = createHostFactory({
    component: SpinnerComponent,
    imports: [
      CommonModule,
      IconModule,
      LabelModule,
      HttpClientTestingModule,
      IconLibraryTestingModule,
      RouterTestingModule
    ],
    declareComponent: true
  });

  test('should show spinner while observable is not complete', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      spectator = createHost(`<ht-spinner [data$]="data$" [loadingLabel]="loadingLabel"></ht-spinner>`, {
        hostProps: {
          data$: NEVER,
          loadingLabel: 'Loading...'
        }
      });

      expectObservable(spectator.component.state$!).toBe('(y)', { y: 'loading' });
    });
  }));

  test('should show sucess label when observable completes', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      spectator = createHost(
        `<ht-spinner [data$]="data$" [loadingLabel]="loadingLabel" [successLabel]="successLabel"></ht-spinner>`,
        {
          hostProps: {
            data$: of(true),
            successLabel: 'Successful',
            loadingLabel: 'Loading...'
          }
        }
      );

      expectObservable(spectator.component.state$!).toBe('(x-y|)', { x: 'loading', y: 'success' });
    });
  }));

  test('should show error when observable errors out', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      spectator = createHost(
        `<ht-spinner [data$]="data$" [loadingLabel]="loadingLabel" [errorLabel]="errorLabel"></ht-spinner>`,
        {
          hostProps: {
            data$: throwError(new Error('Internal Error')),
            loadingLabel: 'Loading...',
            errorLabel: 'Internal Error'
          }
        }
      );

      expectObservable(spectator.component.state$!).toBe('(x-y|)', { x: 'loading', y: 'error' });
    });
  }));
});
