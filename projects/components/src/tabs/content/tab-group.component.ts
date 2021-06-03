import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList
} from '@angular/core';
import { isEmpty } from 'lodash-es';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'ht-tab-group',
  styleUrls: ['./tab-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-group">
      <mat-tab-group
        animationDuration="0ms"
        disableRipple
        (selectedTabChange)="this.onSelectedTabChange($event.index)"
        [selectedIndex]="this.activeTabIndex"
      >
        <mat-tab *ngFor="let tab of this.tabs; index as i">
          <ng-template mat-tab-label>
            <div class="tab-label">
              {{ tab.label }}
              <div *ngIf="tab.badge" [ngClass]="{ active: this.activeTabIndex === i }" class="tab-badge">
                {{ tab.badge }}
              </div>
            </div>
            <div class="ink-bar" [ngClass]="{ active: this.activeTabIndex === i }"></div>
          </ng-template>
          <ng-template matTabContent>
            <ng-container *ngTemplateOutlet="tab.content"></ng-container>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class TabGroupComponent implements OnChanges, AfterViewInit {
  @ContentChildren(TabComponent)
  public tabs!: QueryList<TabComponent>;

  @Input()
  public activeLabel?: string;

  @Output()
  public readonly activeLabelChange: EventEmitter<string> = new EventEmitter();

  public activeTabIndex: number = 0;

  public ngOnChanges(): void {
    this.setActiveTabIndexBasedOnLabel();
  }

  public ngAfterViewInit(): void {
    this.setActiveTabIndexBasedOnLabel();
  }

  public onSelectedTabChange(index: number): void {
    this.activeTabIndex = index;
    this.activeLabelChange.emit(this.tabs?.get(index)?.label);
  }

  private setActiveTabIndexBasedOnLabel(): void {
    if (!isEmpty(this.tabs) && !isEmpty(this.activeLabel)) {
      this.tabs.forEach((tab: TabComponent, index: number) => {
        if (tab.label === this.activeLabel) {
          this.activeTabIndex = index;
        }
      });
    }
  }
}
