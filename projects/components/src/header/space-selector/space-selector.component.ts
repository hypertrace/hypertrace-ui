import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'htc-space-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./space-selector.component.scss'],
  template: `
    <div class="space-selector-wrapper">
      <htc-select selected="all" class="space-selector">
        <htc-select-option value="all" label="All Spaces"> </htc-select-option>
      </htc-select>
    </div>
  `
})
export class SpaceSelectorComponent {}
