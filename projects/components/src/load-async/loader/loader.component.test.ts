import { CommonModule } from '@angular/common';
import { ImagesAssetPath, LoaderType } from '@hypertrace/assets-library';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { LoaderComponent } from './loader.component';

describe('Loader component', () => {
  let spectator: SpectatorHost<LoaderComponent>;

  const createHost = createHostFactory({
    component: LoaderComponent,
    imports: [CommonModule]
  });

  test('Loader component when loader type is page', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Page}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Page);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderPage);
  });

  test('Loader component when loader type is not passed', () => {
    spectator = createHost(`<ht-loader></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Spinner);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderSpinner);
  });

  test('Loader component when loader type is spinner', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Spinner}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Spinner);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderSpinner);
  });

  test('Loader component loader type is expandable row', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.ExpandableRow}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.ExpandableRow);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderExpandableRow);
  });
});
