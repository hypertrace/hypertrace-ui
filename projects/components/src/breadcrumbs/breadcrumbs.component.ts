import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Breadcrumb, NavigationService, TypedSimpleChanges } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./breadcrumbs.component.scss'],
  template: `
    <div class="breadcrumbs">
      <div class="breadcrumb-section" *ngIf="this.breadcrumbs.length > 1">
        <div
          class="breadcrumb"
          [ngClass]="{ navigable: breadcrumb.url !== undefined }"
          *ngFor="let breadcrumb of this.breadcrumbs; last as isLast; first as isFirst"
          [htTooltip]="this.tooltipMap.get(breadcrumb)"
        >
          <ht-icon
            class="icon"
            *ngIf="isFirst || breadcrumb.alwaysShowIcon"
            [icon]="breadcrumb.icon"
            [label]="breadcrumb.label"
            size="${IconSize.Small}"
          ></ht-icon>
          <ht-label
            [label]="breadcrumb.label"
            [ngClass]="{ 'inactive-crumb': isLast }"
            (click)="this.onNavigate(breadcrumb)"
          ></ht-label>
          <div class="divider" *ngIf="!isLast"></div>
        </div>
      </div>
    </div>
  `
})
export class BreadcrumbsComponent implements OnChanges {
  @Input()
  public breadcrumbs: Breadcrumb[] = [];

  public tooltipMap: WeakMap<Breadcrumb, string> = new WeakMap();

  public constructor(private readonly navigationService: NavigationService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.breadcrumbs) {
      this.breadcrumbs.forEach(breadcrumb => this.tooltipMap.set(breadcrumb, this.buildTooltip(breadcrumb)));
    }
  }

  public onNavigate(breadcrumb: Breadcrumb): void {
    if (breadcrumb.url !== undefined) {
      this.navigationService.navigateWithinApp(breadcrumb.url);
    }
  }

  private buildTooltip(breadcrumb: Breadcrumb): string {
    if (isNil(breadcrumb.label)) {
      return '';
    }

    return `${breadcrumb.label}`;
  }
}
