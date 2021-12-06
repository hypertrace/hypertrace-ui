import { fakeAsync } from '@angular/core/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { SearchBoxComponent, SearchBoxDisplayMode } from './search-box.component';

describe('Search box Component', () => {
  let spectator: Spectator<SearchBoxComponent>;

  const createHost = createHostFactory({
    component: SearchBoxComponent,
    shallow: true
  });

  test('should work with default values', fakeAsync(() => {
    spectator = createHost(`<ht-search-box [placeholder]="placeholder"></ht-search-box>`, {
      hostProps: {
        placeholder: 'Test Placeholder'
      }
    });

    const inputElement = spectator.query('input');
    expect((inputElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('x', {
        x: 'Test'
      });

      spectator.triggerEventHandler('input', 'input', spectator.component.value);
      spectator.tick();
    });
  }));

  test('should apply no-border class correctly', () => {
    spectator = createHost(`<ht-search-box [displayMode]="displayMode"></ht-search-box>`, {
      hostProps: {
        displayMode: SearchBoxDisplayMode.NoBorder
      }
    });

    expect(spectator.query('.ht-search-box')?.classList).toContain('no-border');
    expect(spectator.query('.ht-search-box')?.classList).not.toContain('border');
  });

  test('should apply border class correctly by default', () => {
    spectator = createHost(`<ht-search-box></ht-search-box>`);

    expect(spectator.query('.ht-search-box')?.classList).not.toContain('no-border');
    expect(spectator.query('.ht-search-box')?.classList).toContain('border');
  });

  test('should work with arbitrary debounce time', fakeAsync(() => {
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" [debounceTime]="debounceTime"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder',
          debounceTime: 200
        }
      }
    );

    const inputElement = spectator.query('input');
    expect((inputElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test2';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('200ms x', {
        x: 'Test2'
      });

      spectator.triggerEventHandler('input', 'input', spectator.component.value);
      spectator.tick();
    });
  }));
});
