import { CommonModule } from '@angular/common';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';
import { DraggableListComponent } from './draggable-list.component';

describe('Draggable List Component', () => {
  const createHost = createHostFactory<DraggableListComponent>({
    component: DraggableListComponent,
    imports: [CommonModule],
    declarations: [MockComponent(DraggableItemComponent)],
    shallow: true
  });

  let spectator: SpectatorHost<DraggableListComponent>;

  test('should display draggable list component', () => {
    spectator = createHost(
      `<ht-draggable-list>
        <ht-draggable-item>Item 1</ht-draggable-item>
        <ht-draggable-item>Item 2</ht-draggable-item>
      </ht-draggable-list>
      `
    );

    expect(spectator.component.disabled).toBe(false);
    expect(spectator.component.draggableItems.length).toBe(2);
  });
});
