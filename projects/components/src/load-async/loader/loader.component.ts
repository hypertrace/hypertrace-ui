import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { LoaderType } from '../load-async.service';

// TODO 7872 put display class on img when its displayed to center it
@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader">
      <!--      <img [ngClass]="[this.currentLoaderType]" [src]="this.getImagePathFromType(this.currentLoaderType)" />-->
      <ht-skeleton></ht-skeleton>
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType;

  public currentLoaderType: LoaderType = LoaderType.Spinner;

  public ngOnChanges(): void {
    this.currentLoaderType = this.loaderType ?? LoaderType.Spinner;
  }

  public getImagePathFromType(loaderType: LoaderType): ImagesAssetPath {
    switch (loaderType) {
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
