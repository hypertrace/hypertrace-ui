import { fakeAsync } from '@angular/core/testing';
import { createHostFactory } from '@ngneat/spectator/jest';

import { CheckboxComponent, InputComponent, InputModule, TraceCheckboxModule } from '@hypertrace/components';
import { ExploreQueryLimitEditorComponent } from './explore-query-limit-editor.component';

describe('Explore Query Limit Editor component', () => {
  const hostBuilder = createHostFactory({
    component: ExploreQueryLimitEditorComponent,
    imports: [InputModule, TraceCheckboxModule],
    shallow: true
  });

  test('displays the provided limit', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-limit-editor [limit]="limit">
    </ht-explore-query-limit-editor>`,
      {
        hostProps: {
          limit: 12
        }
      }
    );

    expect(spectator.query(InputComponent)!.value).toBe(12);
  });

  test('updates when the provided limit changes', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-limit-editor [limit]="limit">
    </ht-explore-query-limit-editor>`,
      {
        hostProps: {
          limit: 12
        }
      }
    );

    spectator.setHostInput({
      limit: 13
    });
    expect(spectator.query(InputComponent)!.value).toBe(13);
  });

  test('emits changes to limit', () => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-limit-editor [limit]="limit" (limitChange)="onChange($event)">
    </ht-explore-query-limit-editor>`,
      {
        hostProps: {
          limit: 12,
          onChange: onChange
        }
      }
    );

    const inputEl = spectator.query('input') as HTMLInputElement;

    inputEl.value = '5';
    spectator.dispatchFakeEvent(inputEl, 'input');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  test('updates when includeRestChanges', () => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-limit-editor [limit]="limit" [includeRest]="includeRest">
    </ht-explore-query-limit-editor>`,
      {
        hostProps: {
          limit: 12,
          includeRest: true
        }
      }
    );

    const checkbox = spectator.query(CheckboxComponent)!;

    expect(checkbox.checked).toBe(true);

    spectator.setHostInput({
      includeRest: false
    });

    expect(checkbox.checked).toBe(false);
  });

  test('emits when includeRest checkbox is clicked', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-limit-editor [limit]="limit" [includeRest]="includeRest" (includeRestChange)="onChange($event)">
    </ht-explore-query-limit-editor>`,
      {
        hostProps: {
          limit: 12,
          includeRest: true,
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('input[type=checkbox]');
    expect(onChange).toHaveBeenCalledWith(false);
  }));
});
