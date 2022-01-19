import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { SkeletonType } from '../../skeleton/skeleton.component';
import { ImgLoaderType, LoaderType } from '../load-async.service';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader" [ngClass]="{ 'flex-centered': this.isOldLoaderType }">
      <ng-container *ngIf="!this.isOldLoaderType; else oldLoaderTemplate">
        <ht-skeleton [shapeStyle]="this.skeletonType"></ht-skeleton>
      </ng-container>

      <ng-template #oldLoaderTemplate>
        <img [ngClass]="[this.currentLoaderType]" [src]="this.imagePath" />
      </ng-template>
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType;

  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public currentLoaderType: LoaderType = ImgLoaderType.Spinner;

  public imagePath: ImagesAssetPath = ImagesAssetPath.LoaderSpinner;

  public isOldLoaderType: boolean = true;

  public ngOnChanges(): void {
    this.currentLoaderType = this.loaderType ?? ImgLoaderType.Spinner;

    if (this.determineIfOldLoaderType(this.currentLoaderType)) {
      this.isOldLoaderType = true;
      this.imagePath = this.getImagePathFromType(this.currentLoaderType as ImgLoaderType);
    } else {
      this.isOldLoaderType = false;
      this.skeletonType = this.currentLoaderType as SkeletonType;
    }
  }

  public determineIfOldLoaderType(loaderType: LoaderType): boolean {
    switch (loaderType) {
      case ImgLoaderType.Spinner:
      case ImgLoaderType.ExpandableRow:
      case ImgLoaderType.Page:
        return true;
      case SkeletonType.Circle:
      case SkeletonType.Text:
      case SkeletonType.ListItem:
      case SkeletonType.Rectangle:
      case SkeletonType.Square:
      case SkeletonType.TableRow:
      case SkeletonType.Donut:
        return false;
      default:
        return assertUnreachable(loaderType);
    }
  }

  public getImagePathFromType(loaderType: ImgLoaderType): ImagesAssetPath {
    switch (loaderType) {
      case ImgLoaderType.ExpandableRow:
        return ImagesAssetPath.LoaderExpandableRow;
      case ImgLoaderType.Page:
        return ImagesAssetPath.LoaderPage;
      case ImgLoaderType.Spinner:
      default:
        return ImagesAssetPath.LoaderSpinner;
    }
  }
}
