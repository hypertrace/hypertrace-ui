import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ht-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <router-outlet></router-outlet> `
})
export class RootComponent {}
