import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath, LoaderTypes } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  template: `
    <div class="ht-loader">
      <img [ngClass]="[this.type]" [src]="this.imagePath" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnChanges {
  @Input()
  public type: LoaderTypes = LoaderTypes.Horizontal;
  public imagePath: ImagesAssetPath = ImagesAssetPath.LoaderHorizontal;

  public ngOnChanges(): void {
    // Unfortunatly passing undefined is overwriting default value
    this.type = this.type ?? LoaderTypes.Horizontal;
    this.imagePath = this.getImagePathFromType();
  }

  private getImagePathFromType(): ImagesAssetPath {
    switch (this.type) {
      case LoaderTypes.Horizontal:
        return ImagesAssetPath.LoaderHorizontal;
      case LoaderTypes.LargeSquare:
        return ImagesAssetPath.LoaderLargeSquare;
      case LoaderTypes.SmallCircle:
        return ImagesAssetPath.LoaderSmallCircle;
      default:
        return assertUnreachable(this.type);
    }
  }
}
