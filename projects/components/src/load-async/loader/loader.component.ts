import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ImagesAssetPath, LoaderSize } from '@hypertrace/assets-library';
@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  template: `
    <div class="ht-loader" [ngSwitch]="this.size">
      <img
        class="${LoaderSize.Medium}"
        *ngSwitchCase="'${LoaderSize.Medium}'"
        src="${ImagesAssetPath.LoaderHorizontal}"
      />
      <img class="${LoaderSize.Large}" *ngSwitchCase="'${LoaderSize.Large}'" src="${ImagesAssetPath.LoaderLarge}" />
      <img class="${LoaderSize.Small}" *ngSwitchCase="'${LoaderSize.Small}'" src="${ImagesAssetPath.LoaderSmall}" />
      <img class="${LoaderSize.Medium}" *ngSwitchDefault src="${ImagesAssetPath.LoaderHorizontal}" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  @Input()
  public size: LoaderSize = LoaderSize.Medium;
}
