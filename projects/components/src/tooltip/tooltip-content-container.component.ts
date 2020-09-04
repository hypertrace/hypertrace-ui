import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import { POPOVER_DATA } from '../popover/popover';

@Component({
  selector: 'htc-tooltip-content-container',
  styleUrls: ['./tooltip-content-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tooltip-container">
      <ng-container *ngIf="this.isComplexContent; else simpleContent">
        <ng-container *ngTemplateOutlet="this.content"> </ng-container>
      </ng-container>

      <ng-template #simpleContent>
        {{ this.content }}
      </ng-template>
    </div>
  `
})
export class TooltipContentContainerComponent {
  public readonly isComplexContent: boolean;
  public constructor(@Inject(POPOVER_DATA) public readonly content: string | TemplateRef<unknown>) {
    this.isComplexContent = content instanceof TemplateRef;
  }
}
