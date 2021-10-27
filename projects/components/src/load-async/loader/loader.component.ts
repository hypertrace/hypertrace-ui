import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath, LoaderType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader">
      <img [ngClass]="[this.loaderType]" [src]="this.imagePath" />
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType;

  public imagePath?: ImagesAssetPath;

  public ngOnChanges(): void {
    if (isNil(this.loaderType)) {
      this.loaderType = LoaderType.Spinner;
    }
    this.imagePath = this.getImagePathFromType();
  }

  private getImagePathFromType(): ImagesAssetPath {
    switch (this.loaderType) {
      case LoaderType.ExpandableRow:
        return ImagesAssetPath.LoaderExpandableRow;
      case LoaderType.Page:
        return ImagesAssetPath.LoaderPage;
      case LoaderType.Spinner:
      default:
        return ImagesAssetPath.LoaderSpinner;
    }
  }
}
