import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { SkeletonComponent, SkeletonType } from './skeleton.component';

describe('Skeleton Component', () => {
  const createHost = createHostFactory<SkeletonComponent>({
    component: SkeletonComponent
  });

  let spectator: SpectatorHost<SkeletonComponent>;

  test('Should only be one skeleton element by default', () => {
    spectator = createHost(`<ht-skeleton></ht-skeleton>`);

    expect(spectator.query('.skeleton.skeleton-rectangle')).toExist();
    expect(spectator.query('.skeleton-repeating')).not.toExist();
    expect(spectator.queryAll('.skeleton.skeleton-rectangle').length).toEqual(1);
  });

  test('Should display number of skeleton elements equal to the repeat input', () => {
    spectator = createHost(`<ht-skeleton [shapeStyle]="'${SkeletonType.ListItem}'" [repeat]="repeat"></ht-skeleton>`);
    spectator.setHostInput({ repeat: 3 });

    expect(spectator.query('.skeleton.skeleton-list-item')).toExist();
    expect(spectator.query('.skeleton .item-circle')).toExist();
    expect(spectator.queryAll('.skeleton.skeleton-repeating')).toHaveLength(3);
  });

  test('Should match the skeleton type to the corresponding element', () => {
    const skeletonInputData: { type: SkeletonType; repeat: number }[] = [
      {
        type: SkeletonType.Donut,
        repeat: 1
      },
      {
        type: SkeletonType.RectangleText,
        repeat: 2
      },
      {
        type: SkeletonType.Rectangle,
        repeat: 1
      },
      {
        type: SkeletonType.Circle,
        repeat: 1
      },
      {
        type: SkeletonType.TableRow,
        repeat: 3
      },
      {
        type: SkeletonType.Square,
        repeat: 1
      },
      {
        type: SkeletonType.ListItem,
        repeat: 2
      }
    ];
    spectator = createHost(`<ht-skeleton [shapeStyle]="shapeStyle" [repeat]="repeat"></ht-skeleton>`);

    skeletonInputData.forEach(testConfig => {
      spectator.setHostInput({ shapeStyle: testConfig.type });
      spectator.setHostInput({ repeat: testConfig.repeat });

      const shapeContainerClass = `.skeleton-${testConfig.type}`;
      expect(spectator.query(shapeContainerClass)).toExist();
      expect(spectator.queryAll(shapeContainerClass)).toHaveLength(testConfig.repeat);
    });
  });
});
