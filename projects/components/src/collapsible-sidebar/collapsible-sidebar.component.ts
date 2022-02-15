import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-collapsible-sidebar',
  styleUrls: ['./collapsible-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="collapsible-sidebar" [ngClass]="{ collapsed: !this.isExpanded }">
      <div class="content">
        <ng-container *ngIf="this.isExpanded; else labelTemplate"><ng-content></ng-content></ng-container>
      </div>
      <ng-template #stringLabelTemplate
        ><span class="string-label">{{ this.label }}</span></ng-template
      >
      <ng-template #labelTemplate
        ><ng-container *ngTemplateOutlet="this.isLabelATemplate ? this.label : stringLabelTemplate"></ng-container
      ></ng-template>
      <div class="toggle" (click)="this.toggleCollapseExpand()">
        <ht-icon
          class="icon"
          [icon]="this.isExpanded ? '${IconType.TriangleLeft}' : '${IconType.TriangleRight}'"
          size="${IconSize.Small}"
        ></ht-icon>
      </div>
    </div>
  `
})
export class CollapsibleSidebarComponent implements OnChanges {
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

  public toggleCollapseExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
