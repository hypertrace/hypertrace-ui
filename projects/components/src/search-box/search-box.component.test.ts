import { fakeAsync, flush } from '@angular/core/testing';
import { FeatureState, FeatureStateResolver, IsEmptyPipeModule } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { SearchBoxComponent, SearchBoxDisplayMode, SearchBoxEmitMode } from './search-box.component';
import { PopoverService } from '../popover/popover.service';

describe('Search box Component', () => {
  const testPopoverRef = {
    closeOnBackdropClick: jest.fn(),
    closeOnPopoverContentClick: jest.fn(),
    close: jest.fn()
  };

  let spectator: Spectator<SearchBoxComponent>;

  const createHost = createHostFactory({
    component: SearchBoxComponent,
    shallow: true,
    providers: [
      mockProvider(FeatureStateResolver, {
        getFeatureState: jest.fn().mockReturnValue(of(FeatureState.Enabled))
      }),
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(testPopoverRef)
      })
    ],
    imports: [IsEmptyPipeModule]
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

  test('onSubmit mode should work as expected', fakeAsync(() => {
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" [debounceTime]="debounceTime" [searchMode]="searchMode"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder',
          debounceTime: 200,
          searchMode: SearchBoxEmitMode.OnSubmit
        }
      }
    );

    const inputElement = spectator.query('input');
    expect((inputElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test2';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('5000ms x', {
        x: 'Test2'
      });

      spectator.triggerEventHandler('input', 'input', spectator.component.value);
      spectator.tick();
    });
  }));

  test('enabled search history should work as expected', fakeAsync(() => {
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" [debounceTime]="debounceTime" [searchMode]="searchMode" [enableSearchHistory]="enableSearchHistory"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder',
          debounceTime: 200,
          searchMode: SearchBoxEmitMode.Incremental,
          enableSearchHistory: true
        }
      }
    );

    const searchBoxELement = spectator.query('.ht-search-box')!;
    expect(searchBoxELement).toHaveClass('with-search-history');
    expect(searchBoxELement).not.toHaveClass('has-value');
    expect(searchBoxELement).not.toHaveClass('focused');

    spectator.click('.icon.search');
    expect(searchBoxELement).toHaveClass('focused');
    expect(spectator.inject(PopoverService).drawPopover).not.toHaveBeenCalled();

    const inputElement = spectator.query('input') as HTMLInputElement;
    spectator.setInput({ value: 'test-value' });
    spectator.triggerEventHandler('input', 'input', 'test-value');
    expect(searchBoxELement).toHaveClass('has-value');
    spectator.tick(500);

    inputElement.blur();
    spectator.click('.icon.close');
    spectator.tick(500);
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();

    flush();
  }));
});
