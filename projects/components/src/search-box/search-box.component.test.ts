import { fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { SearchBoxComponent } from './search-box.component';

describe('Search box Component', () => {
  let spectator: Spectator<SearchBoxComponent>;

  const createHost = createHostFactory({
    component: SearchBoxComponent,
    shallow: true
  });

  test('should work with default values', fakeAsync(() => {
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" (valueChange)="onValueChange($event)"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder'
        }
      }
    );

    const inputDebugElement = spectator.debugElement.query(By.css('input'));
    expect((inputDebugElement.nativeElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('x', {
        x: 'Test'
      });

      spectator.triggerEventHandler(inputDebugElement, 'input', spectator.component.value);
      spectator.tick();
    });
  }));

  test('should work with arbitrary debounce time', fakeAsync(() => {
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" [debounceTime]="debounceTime" (valueChange)="onValueChange($event)"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder',
          debounceTime: 200
        }
      }
    );

    const inputDebugElement = spectator.debugElement.query(By.css('input'));
    expect((inputDebugElement.nativeElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test2';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('200ms x', {
        x: 'Test2'
      });

      spectator.triggerEventHandler(inputDebugElement, 'input', spectator.component.value);
      spectator.tick();
    });
  }));
});
