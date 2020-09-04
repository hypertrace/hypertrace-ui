import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'htc-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./divider.component.scss'],
  template: ` <div class="divider"></div> `
})
export class DividerComponent {}
