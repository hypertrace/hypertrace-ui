import { ChangeDetectionStrategy, Component } from '@angular/core';
import { homeDashboard } from './home.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.scss'],
  template: `
    <div class="home">
      <htc-navigable-dashboard navLocation="${homeDashboard.location}"> </htc-navigable-dashboard>
    </div>
  `
})
export class HomeComponent {}
