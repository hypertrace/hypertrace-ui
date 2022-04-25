import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import { POPOVER_DATA } from '../popover/popover';

@Component({
  selector: 'ht-tooltip-content-container',
  styleUrls: ['./tooltip-content-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tooltip-container">
      <ng-container *ngIf="this.isComplexContent; else simpleContent">
        <ng-container *ngTemplateOutlet="this.templateRef; context: this.data.context"></ng-container>
      </ng-container>

      <ng-template #simpleContent>
        {{ this.data.content }}
      </ng-template>
    </div>
  `
})
export class TooltipContentContainerComponent {
  public readonly isComplexContent: boolean;
  public readonly templateRef: TemplateRef<unknown>;

  public constructor(
    @Inject(POPOVER_DATA) public readonly data: { content: string | TemplateRef<unknown>; context: unknown }
  ) {
    this.isComplexContent = data.content instanceof TemplateRef;
    this.templateRef = data.content as TemplateRef<unknown>;
  }
}
