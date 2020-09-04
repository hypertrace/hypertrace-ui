import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'htc-beta-tag',
  styleUrls: ['./beta-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="beta-tag">
      Beta
    </div>
  `
})
export class BetaTagComponent {}
