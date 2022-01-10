import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TimeRangeService } from '@hypertrace/common';
import { ButtonStyle, POPOVER_DATA } from '@hypertrace/components';
import { CartesianSelectedData } from '../../../../../../components/cartesian/chart-interactivty';
import { CartesainExplorerNavigationService } from '../cartesian-explorer-navigation.service';

@Component({
  selector: 'ht-cartesian-explorer-context-menu',
  styleUrls: ['./cartesian-explorer-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="context-menu-container">
      <div *ngFor="let menu of menus">
        <div class="context-menu">
          <ht-button [label]="menu.name" [icon]="menu.icon" [display]="display" (click)="menu.onClick()"></ht-button>
        </div>

        <ht-divider></ht-divider>
      </div>
    </div>
  `
})
export class CartesianExplorerContextMenuComponent<TData> {
  public menus?: ContextMenu[] = [
    {
      name: 'Set Time Range',
      icon: IconType.Alarm,
      onClick: () => this.setTimeRangeHandler()
    },
    {
      name: 'Explore',
      icon: IconType.ArrowUpRight,
      onClick: () => this.explorerNavigationHandler()
    }
  ];

  public display: string = ButtonStyle.PlainText;
  public selectionData: CartesianSelectedData<TData>;

  public constructor(
    @Inject(POPOVER_DATA) data: CartesianSelectedData<TData>,
    private readonly cartesainExplorerNavigationService: CartesainExplorerNavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {
    this.selectionData = data;
  }

  public readonly explorerNavigationHandler = () => {
    this.cartesainExplorerNavigationService.navigateToExplorer(
      this.selectionData.timeRange.startTime,
      this.selectionData.timeRange.endTime
    );
  };

  public readonly setTimeRangeHandler = () => {
    this.timeRangeService.setFixedRange(this.selectionData.timeRange.startTime, this.selectionData.timeRange.endTime);
  };
}

export interface ContextMenu {
  name: string;
  icon: string;
  onClick(): void;
}
