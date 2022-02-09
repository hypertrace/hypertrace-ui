import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-collapsible-sidebar',
  styleUrls: ['./collapsible-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="collapsible-sidebar">
      <div class="label" [ngClass]="{ string: !this.isLabelATemplate }">
        <ng-template #stringLabelTemplate>{{ this.label }}</ng-template>
        <ng-container *ngTemplateOutlet="this.isLabelATemplate ? this.label : stringLabelTemplate"><ng-container>
      </div>
      <div class="content"><ng-content></ng-content></div>
      <ht-icon class="toggle-icon" [icon]="this.isExpanded ? '${IconType.TriangleLeft}' : '${IconType.TriangleRight}'" size="${IconSize.Small}"></ht-icon>
    </div>
  `
})
export class CollapsibleSidebarComponent {
  @Input()
  public label: string | TemplateRef<unknown> = '';

  @Input()
  public expanded: boolean = false;

  public isExpanded: boolean = false;

  public ngOnChanges(): void {
    this.isExpanded = this.expanded;
  }

  public get isLabelATemplate(): boolean {
    return typeof this.label !== 'string';
  }

  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }
}
