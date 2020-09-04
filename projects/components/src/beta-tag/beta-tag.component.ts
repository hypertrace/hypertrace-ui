import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ht-beta-tag',
  styleUrls: ['./beta-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="beta-tag">
      Beta
    </div>
  `
})
export class BetaTagComponent {}
