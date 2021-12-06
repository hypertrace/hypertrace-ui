import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { SelectGroupPosition } from './select-group-position';
import { SelectGroupComponent } from './select-group.component';
import { SelectModule } from './select.module';

describe('Select group component', () => {
  const hostFactory = createHostFactory({
    component: SelectGroupComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [mockProvider(NavigationService)]
  });

  test('renders a single select with appropriate styles', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-select-group>
        <ht-select selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
    </ht-select-group>`);
    spectator.tick();
    const selects = spectator.queryAll('.select');
    expect(selects.length).toBe(1);
    expect(selects[0]).toHaveClass(SelectGroupPosition.Ungrouped);
  }));

  test('renders two selects with appropriate styles', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-select-group>
        <ht-select selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
        <ht-select selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
    </ht-select-group>`);
    spectator.tick();
    const selects = spectator.queryAll('.select');
    expect(selects.length).toBe(2);
    expect(selects[0]).toHaveClass(SelectGroupPosition.Left);
    expect(selects[1]).toHaveClass(SelectGroupPosition.Right);
  }));

  test('renders more than two selects with appropriate styles', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-select-group>
        <ht-select selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
        <ht-select selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
        <ht-select selected="value">
        <ht-select-option value="value" label="Label"></ht-select-option>
      </ht-select>
    </ht-select-group>`);
    spectator.tick();
    const selects = spectator.queryAll('.select');
    expect(selects.length).toBe(3);
    expect(selects[0]).toHaveClass(SelectGroupPosition.Left);
    expect(selects[1]).toHaveClass(SelectGroupPosition.Center);
    expect(selects[2]).toHaveClass(SelectGroupPosition.Right);
  }));

  test('updates styling with select content has changed', fakeAsync(() => {
    const spectator = hostFactory(
      `
    <ht-select-group>
        <ht-select *ngFor="let index of selectCount" selected="value">
          <ht-select-option value="value" label="Label"></ht-select-option>
        </ht-select>
    </ht-select-group>`,
      {
        hostProps: {
          selectCount: Array(1).fill(undefined)
        }
      }
    );
    spectator.tick();
    const initialSelects = spectator.queryAll('.select');
    expect(initialSelects.length).toBe(1);
    expect(initialSelects[0]).toHaveClass(SelectGroupPosition.Ungrouped);

    spectator.setHostInput({ selectCount: Array(2).fill(undefined) });
    spectator.tick();

    const updatedSelects = spectator.queryAll('.select');
    expect(updatedSelects.length).toBe(2);
    expect(updatedSelects[0]).toHaveClass(SelectGroupPosition.Left);
    expect(updatedSelects[1]).toHaveClass(SelectGroupPosition.Right);
  }));
});
