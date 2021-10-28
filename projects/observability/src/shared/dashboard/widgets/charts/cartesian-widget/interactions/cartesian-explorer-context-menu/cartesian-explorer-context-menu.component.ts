import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonStyle } from '@hypertrace/components';

@Component({
  selector: 'ht-cartesian-explorer-context-menu',
  styleUrls: ['./cartesian-explorer-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="context-menu-container">
      <div *ngFor="let menu of menus">
        <div class="context-menu">
          <ht-button
            [label]="menu.name"
            [icon]="menu.icon"
            [display]="display"
            (click)="menuSelectHandler(menu)"
          ></ht-button>
        </div>

        <ht-divider></ht-divider>
      </div>
    </div>
  `
})
export class CartesianExplorerContextMenuComponent {
  @Input()
  public menus?: ContextMenu[];

  @Output()
  public readonly menuSelect: EventEmitter<ContextMenu> = new EventEmitter();

  public display: string = ButtonStyle.PlainText;

  public menuSelectHandler = (menu: ContextMenu): void => {
    this.menuSelect.emit(menu);
  };
}

export interface ContextMenu {
  name: string;
  icon: string;
}
