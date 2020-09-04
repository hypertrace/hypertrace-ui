import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ht-space-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./space-selector.component.scss'],
  template: `
    <div class="space-selector-wrapper">
      <ht-select selected="all" class="space-selector">
        <ht-select-option value="all" label="All Spaces"> </ht-select-option>
      </ht-select>
    </div>
  `
})
export class SpaceSelectorComponent {}
