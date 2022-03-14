import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'ht-draggable-item-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./draggable-item-panel.component.scss'],
  template: `
    <ng-template #draggableItemPanel>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class DraggableItemPanelComponent {
  @ViewChild('draggableItemPanel', { static: true })
  public content!: TemplateRef<unknown>;
}
