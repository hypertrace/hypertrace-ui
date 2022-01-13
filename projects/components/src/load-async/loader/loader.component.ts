import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { LoaderType } from '../load-async.service';

// TODO 7872 add configs to switch cases

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader" [ngClass]="this.containerDisplayClass()" [ngSwitch]="this.currentLoaderType">
      <ht-skeleton *ngSwitchCase="'${LoaderType.Rectangle}'" [shapeStyle]="'${LoaderType.Rectangle}'"></ht-skeleton>
      <ht-skeleton
        *ngSwitchCase="'${LoaderType.RectangleText}'"
        [shapeStyle]="'${LoaderType.RectangleText}'"
      ></ht-skeleton>
      <ht-skeleton *ngSwitchCase="'${LoaderType.Circle}'" [shapeStyle]="'${LoaderType.Circle}'"></ht-skeleton>
      <ht-skeleton *ngSwitchCase="'${LoaderType.Square}'" size="3rem"></ht-skeleton>
      <img
        *ngSwitchDefault
        [ngClass]="[this.currentLoaderType]"
        [src]="this.getImagePathFromType(this.currentLoaderType)"
      />
      <!--      <ht-skeleton></ht-skeleton>-->
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

  public containerDisplayClass(): { 'flex-centered': boolean } {
    // return { 'flex-centered': false }
    return {
      'flex-centered':
        this.currentLoaderType === LoaderType.ExpandableRow ||
        this.currentLoaderType === LoaderType.Spinner ||
        this.currentLoaderType === LoaderType.Page
    };
  }
}
