import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { PanelBodyComponent } from './body/panel-body.component';
import { PanelHeaderComponent } from './header/panel-header.component';

@Component({
  selector: 'ht-panel',
  styleUrls: ['./panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-panel fill-container" [htLayoutChangeTrigger]="this.expanded">
      <div *ngIf="this.header" [ngClass]="{ disabled: this.disabled, expanded: this.expanded }" class="header">
        <ng-container #headerContainer></ng-container>
      </div>
      <div class="body" *ngIf="this.expanded && this.body">
        <ng-container *ngTemplateOutlet="this.body!.content"></ng-container>
      </div>
    </div>
  `
})
export class PanelComponent implements AfterViewInit {
  @Input()
  public expanded: boolean = true;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly expandedChange: EventEmitter<boolean> = new EventEmitter();

  @ContentChild(PanelHeaderComponent, { static: true })
  public readonly header?: PanelHeaderComponent;

  @ContentChild(PanelBodyComponent, { static: true })
  public readonly body?: PanelBodyComponent;

  @ViewChild('headerContainer', { read: ViewContainerRef, static: false })
  public readonly headerContainer?: ViewContainerRef;

  public constructor(private readonly renderer: Renderer2, private readonly changeDetector: ChangeDetectorRef) {}

  public ngAfterViewInit(): void {
    if (this.headerContainer && this.header) {
      /*
       * We create the header programatically so that we can get the child element references and add listeners.
       * If the listener were applied outside (i.e. on the div), then the clickbox would be full width regardless of
       * the content size. The div must be full size to allow the content to appropriately grow as needed.
       */
      const embeddedView = this.headerContainer.createEmbeddedView(this.header.content);
      embeddedView.rootNodes.forEach(node => this.renderer.listen(node, 'click', () => this.onExpandChange()));
    }
  }

  public onExpandChange(): void {
    if (this.disabled) {
      return;
    }

    if (this.header && this.header.ignoreInteractions) {
      // Ignore if explicitly turned off
      return;
    }

    this.expanded = !this.expanded;
    this.changeDetector.markForCheck();
    this.expandedChange.emit(this.expanded);
  }
}
