import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'ht-draggable-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #draggableItem>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class DraggableItemComponent {
  @ViewChild('draggableItem', { static: true })
  public content!: TemplateRef<unknown>;

  @Input()
  public disabled: boolean = false;
}
