import { ChangeDetectionStrategy, Component } from '@angular/core';
import { homeDashboard } from './home.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.scss'],
  template: `
    <div class="home">
      <ht-navigable-dashboard navLocation="${homeDashboard.location}"> </ht-navigable-dashboard>
    </div>
  `
})
export class HomeComponent {}
