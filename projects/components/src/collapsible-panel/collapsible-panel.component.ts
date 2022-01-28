import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { CollapsiblePanelBodyComponent } from './collapsible-panel-body.component';
import { CollapsiblePanelHeaderComponent } from './collapsible-panel-header.component';
import { CollapsiblePanelToggleDirective } from './collapsible-panel-toggle.directive';
import { IconSize } from '../icon/icon-size';
import { defaultsDeep } from 'lodash-es';

/**
 * The component can accept a custom title component or
 * use the default one.
 *
 * **Default Header with Icon and Title**
 * ```html
 * <ht-collapsible-panel [title]="'Statistics'">
 *    <ht-collapsible-panel-body>
 *      <p>Hello World</p>
 *    </ht-collapsible-panel-body>
 * </ht-collapsible-panel>
 * ```
 *
 * **Custom Header**
 * ```html
 * <ht-collapsible-panel #collapse>
 *    <ht-collapsible-panel-header>
 *      <div>
 *        <h2>Custom Title</h2>
 *        <button traceCollapsibleSectionToggle>Toggle</button>
 *      </div>
 *    </ht-collapsible-panel-header>
 *    <ht-collapsible-panel-body>
 *      <p>Hello World</p>
 *    </ht-collapsible-panel-body>
 * </ht-collapsible-panel>
 * ```
 */
@Component({
  selector: 'ht-collapsible-panel',
  template: ` <div class="collapsible-panel" [class]="this.display">
    <ng-container *ngIf="this.header; else defaultHeader">
      <div [ngClass]="{ disabled: this.disabled }" class="header">
        <ng-container *ngTemplateOutlet="this.header!.content"></ng-container>
      </div>
    </ng-container>
    <ng-template #defaultHeader>
      <div
        (click)="this.toggle()"
        class="header default"
        tabindex="0"
        (keydown)="this.onHandleHeaderKeyPress($event.code)"
      >
        <ht-icon
          class="toggle-icon"
          [icon]="collapsed ? this.panelOptions.icons.collapsed : this.panelOptions.icons.expanded"
          [size]="this.panelOptions.iconSize"
        ></ht-icon>
        <ht-label class="title" [label]="this.title"></ht-label>
      </div>
    </ng-template>

    <div class="body" *ngIf="!this.collapsed && this.body">
      <ng-container *ngTemplateOutlet="this.body!.content"></ng-container>
    </div>
  </div>`,
  providers: [SubscriptionLifecycle],
  styleUrls: ['collapsible-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsiblePanelComponent implements AfterViewInit {
  @Input()
  public collapsed: boolean = false;

  @Input()
  public title?: string;

  @Input()
  public display: CollapsiblePanelDisplay = CollapsiblePanelDisplay.Transparent;

  @Input()
  public disabled: boolean = false;

  @Input()
  public set options(opts: Partial<CollapsiblePanelOptions>) {
    this.panelOptions = defaultsDeep(opts);
  }

  @Output()
  public readonly collapsedChange: EventEmitter<boolean> = new EventEmitter();

  @ContentChild(CollapsiblePanelHeaderComponent, { static: true })
  public readonly header?: CollapsiblePanelHeaderComponent;

  @ContentChild(CollapsiblePanelBodyComponent, { static: true })
  public readonly body?: CollapsiblePanelBodyComponent;

  @ContentChild(CollapsiblePanelToggleDirective, { static: true })
  public readonly toggleDirective?: CollapsiblePanelToggleDirective;

  public panelOptions: CollapsiblePanelOptions = this.getPanelOptions();

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public ngAfterViewInit(): void {
    if (this.toggleDirective) {
      this.subscriptionLifecycle.add(this.toggleDirective.clicked$.subscribe(() => this.toggle()));
    }
  }

  public toggle(): void {
    if (!this.disabled) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
      // Required if toggle() is called from outside the component
      this.cdr.markForCheck();
    }
  }

  onHandleHeaderKeyPress(code: string) {
    if (['Enter', 'Space'].includes(code)) {
      this.toggle();
    }
  }

  private getPanelOptions(overrides: Partial<CollapsiblePanelOptions> = {}): CollapsiblePanelOptions {
    return defaultsDeep(
      {
        icons: {
          collapsed: IconType.Collapsed,
          expanded: IconType.Expanded
        },
        iconSize: IconSize.Small
      } as CollapsiblePanelOptions,
      overrides
    );
  }
}

export const enum CollapsiblePanelDisplay {
  Transparent = 'transparent',
  WithBackground = 'with-background'
}

export interface CollapsiblePanelOptions {
  icons: {
    expanded: string;
    collapsed: string;
  };
  iconSize: IconSize;
}
