import { ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'ht-tab-group',
  styleUrls: ['./tab-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-group">
      <mat-tab-group animationDuration="0ms" disableRipple (selectedTabChange)="this.activeTabIndex = $event.index">
        <mat-tab *ngFor="let tab of this.tabs; index as i">
          <ng-template mat-tab-label>
            <div class="tab-label">
              {{ tab.label }}
              <div
                *ngIf="tab.subText && tab.subText !== undefined"
                [ngClass]="{ active: activeTabIndex === i }"
                class="sub-text"
              >
                {{ tab.subText }}
              </div>
            </div>
            <div class="ink-bar" [ngClass]="{ active: activeTabIndex === i }"></div>
          </ng-template>
          <ng-template matTabContent>
            <ng-container *ngTemplateOutlet="tab.content"></ng-container>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class TabGroupComponent {
  @ContentChildren(TabComponent)
  public tabs!: QueryList<TabComponent>;

  public activeTabIndex: number = 0;
}
