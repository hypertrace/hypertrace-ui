import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath, LoaderType } from '@hypertrace/assets-library';
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
  public type!: LoaderType;

  public imagePath: ImagesAssetPath = ImagesAssetPath.LoaderExpandableRow;

  public ngOnChanges(): void {
    this.imagePath = this.getImagePathFromType();
  }

  private getImagePathFromType(): ImagesAssetPath {
    switch (this.type) {
      case LoaderType.ExpandableRow:
        return ImagesAssetPath.LoaderExpandableRow;
      case LoaderType.Page:
        return ImagesAssetPath.LoaderPage;
      case LoaderType.Spinner:
        return ImagesAssetPath.LoaderSpinner;
      default:
        return assertUnreachable(this.type);
    }
  }
}
