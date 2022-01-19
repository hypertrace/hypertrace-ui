import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { SkeletonComponent, SkeletonType } from './skeleton.component';

describe('Skeleton Component', () => {
  const createHost = createHostFactory<SkeletonComponent>({
    component: SkeletonComponent
  });

  let spectator: SpectatorHost<SkeletonComponent>;

  test('Should only be one skeleton element by default', () => {
    spectator = createHost(`<ht-skeleton></ht-skeleton>`);

    expect(spectator.query('.skeleton.rectangle')).toExist();
    expect(spectator.query('.repeating')).not.toExist();
    expect(spectator.queryAll('.skeleton.rectangle').length).toEqual(1);
  });

  test('Should display number of skeleton elements equal to the repeat input', () => {
    spectator = createHost(`<ht-skeleton [shapeStyle]="'${SkeletonType.ListItem}'" ></ht-skeleton>`);

    expect(spectator.query('.skeleton.list-item')).toExist();
    expect(spectator.query('.skeleton .item-circle')).toExist();
    expect(spectator.queryAll('.skeleton.repeating')).toHaveLength(4);
  });

  test('Should match the skeleton type to the corresponding element', () => {
    const skeletonInputData: { type: SkeletonType; expectedRepeat: number }[] = [
      {
        type: SkeletonType.Donut,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Text,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Rectangle,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Circle,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.TableRow,
        expectedRepeat: 5
      },
      {
        type: SkeletonType.Square,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.ListItem,
        expectedRepeat: 4
      }
    ];
    spectator = createHost(`<ht-skeleton [shapeStyle]="shapeStyle"></ht-skeleton>`, {
      hostProps: {
        shapeStyle: SkeletonType.Donut
      }
    });

    skeletonInputData.forEach(testConfig => {
      spectator.setHostInput({ shapeStyle: testConfig.type });

      const shapeContainerClass = `.${testConfig.type}`;
      expect(spectator.query(shapeContainerClass)).toExist();
      expect(spectator.queryAll(shapeContainerClass)).toHaveLength(testConfig.expectedRepeat);
    });
  });
});
