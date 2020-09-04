import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'htc-loader',
  styleUrls: ['./loader.component.scss'],
  template: `
    <div class="htc-loader">
      <htc-icon icon="${IconType.Loading}" size="${IconSize.Large}"></htc-icon>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {}
