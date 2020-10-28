import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { IconSize, POPOVER_DATA } from '@hypertrace/components';
import { ExplorerService } from '../../../pages/explorer/explorer-service';
import { ExplorerFilterOnHoverData } from './explorer-filter-on-hover.directive';

@Component({
  selector: 'ht-explorer-filter-on-hover',
  styleUrls: ['./explorer-filter-on-hover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="hover-filter-container">
    <ht-icon
      class="filter-icon"
      icon="${IconType.Filter}"
      [size]="this.filterIconSIze"
      (click)="this.goToExplorerWithFilters()"
    ></ht-icon>
  </div>`
})
export class ExplorerFilterOnHoverComponent {
  public readonly filterIconSIze: IconSize;

  public constructor(
    @Inject(POPOVER_DATA) public readonly data: ExplorerFilterOnHoverData,
    private readonly explorerService: ExplorerService,
    private readonly navigationService: NavigationService
  ) {
    this.filterIconSIze = this.data.iconSize ?? IconSize.ExtraSmall;
  }

  public goToExplorerWithFilters(): void {
    this.explorerService
      .buildNavParamsWithFilters(this.data.scopeQueryParam, this.data.filters)
      .subscribe(params => this.navigationService.navigate(params));
  }
}

export interface FilterOnHoverData {
  filterAction(): void;
}
