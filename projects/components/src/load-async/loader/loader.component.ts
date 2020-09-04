import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  template: `
    <div class="ht-loader">
      <ht-icon icon="${IconType.Loading}" size="${IconSize.Large}"></ht-icon>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {}
