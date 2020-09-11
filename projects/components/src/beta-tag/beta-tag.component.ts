import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-beta-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-label-tag label="Beta" backgroundColor="${Color.Purple2}" labelColor="${Color.Purple5}"></ht-label-tag>
  `
})
export class BetaTagComponent {}
