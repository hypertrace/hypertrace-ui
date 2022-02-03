import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { CustomError, NavigationService } from '@hypertrace/common';
import { createDirectiveFactory, mockProvider, SpectatorDirective } from '@ngneat/spectator/jest';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { IconModule } from '../icon/icon.module';
import { MessageDisplayComponent } from '../message-display/message-display.component';
import { LoadAsyncDirective } from './load-async.directive';
import { LoaderComponent } from './loader/loader.component';
import { LoadAsyncWrapperComponent } from './wrapper/load-async-wrapper.component';

describe('Load Async directive', () => {
  let spectator: SpectatorDirective<LoadAsyncDirective, { data$: Observable<string> }>;

  const createDirective = createDirectiveFactory<LoadAsyncDirective, { data$: Observable<string> }>({
    directive: LoadAsyncDirective,
    declarations: [LoadAsyncWrapperComponent, MessageDisplayComponent, LoaderComponent],
    entryComponents: [LoadAsyncWrapperComponent],
    imports: [CommonModule, IconModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [mockProvider(NavigationService)]
  });

  beforeEach(() => {
    spectator = createDirective(`
      <div *htLoadAsync="data$ as data">
        <span class="test-data">{{ data }}</span>
      </div>
    `);
  });

  test('shows loading state and hides content while loading', fakeAsync(() => {
    spectator.setHostInput({
      data$: of('content').pipe(delay(0))
    });
    expect(spectator.query(LoaderComponent)).toExist();
    expect(spectator.query('.test-data')).not.toExist();
    tick();
    spectator.detectChanges();
    expect(spectator.query(LoaderComponent)).not.toExist();
    expect(spectator.query('.test-data')).toHaveExactText('content');
  }));

  test('shows error state and hides content on error', fakeAsync(() => {
    spectator.setHostInput({
      data$: of('content').pipe(
        delay(0),
        mergeMap(() => throwError(new Error()))
      )
    });
    expect(spectator.query(LoaderComponent)).toExist();
    expect(spectator.query(MessageDisplayComponent)).not.toExist();
    expect(spectator.query('.test-data')).not.toExist();
    tick();
    spectator.detectChanges();
    expect(spectator.query(LoaderComponent)).not.toExist();
    expect(spectator.query(LoadAsyncWrapperComponent)!.icon).toBe(IconType.Error);
    expect(spectator.query('ht-message-display .title')).toContainText('Error');
    expect(spectator.query('ht-message-display .description')).toContainText('');
    expect(spectator.query('.test-data')).not.toExist();
  }));

  test('shows error state with description and hides content on custom error', fakeAsync(() => {
    spectator.setHostInput({
      data$: of('content').pipe(
        delay(0),
        mergeMap(() => throwError(new CustomError('custom error message')))
      )
    });
    expect(spectator.query(LoaderComponent)).toExist();
    expect(spectator.query(MessageDisplayComponent)).not.toExist();
    expect(spectator.query('.test-data')).not.toExist();
    tick();
    spectator.detectChanges();
    expect(spectator.query(LoaderComponent)).not.toExist();
    expect(spectator.query(LoadAsyncWrapperComponent)!.icon).toBe(IconType.Error);
    expect(spectator.query('ht-message-display .title')).toContainText('Internal Error');
    expect(spectator.query('.test-data')).not.toExist();
  }));

  test('shows empty state and hides content on empty observable', fakeAsync(() => {
    spectator.setHostInput({
      data$: EMPTY
    });
    expect(spectator.query(LoaderComponent)).not.toExist();
    expect(spectator.query(LoadAsyncWrapperComponent)!.icon).toBe(IconType.NoData);
    expect(spectator.query('.test-data')).not.toExist();
  }));

  test('updates if given entirely new observable', fakeAsync(() => {
    spectator.setHostInput({
      data$: of('content')
    });
    expect(spectator.query('.test-data')).toHaveExactText('content');

    spectator.setHostInput({
      data$: of('new content').pipe(delay(0))
    });
    expect(spectator.query(LoaderComponent)).toExist();
    expect(spectator.query('.test-data')).not.toExist();
    tick();
    spectator.detectChanges();
    expect(spectator.query('.test-data')).toHaveExactText('new content');
  }));
});
