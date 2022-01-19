import { ChangeDetectionStrategy, Component, HostListener, Inject, Injector, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { GLOBAL_HEADER_HEIGHT, LayoutChangeService } from '@hypertrace/common';
import { ButtonStyle } from '../../button/button';
import { IconSize } from '../../icon/icon-size';
import { PopoverFixedPositionLocation, POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetConstructionData } from '../overlay.service';
import { SheetOverlayConfig, SheetSize } from './sheet';

@Component({
  selector: 'ht-sheet-overlay',
  styleUrls: ['./sheet-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="this.visible">
      <div class="sheet-overlay">
        <ng-container *ngIf="!this.isViewCollapsed">
          <div *ngIf="this.showHeader" class="header">
            <h3 class="header-title">{{ sheetTitle }}</h3>
            <ht-button
              class="close-button"
              icon="${IconType.CloseCircle}"
              display="${ButtonStyle.Outlined}"
              htTooltip="Close Sheet"
              (click)="this.close()"
            >
            </ht-button>
          </div>
          <div class="content-wrapper">
            <div class="content">
              <ng-container *ngIf="this.isComponentSheet; else templateRenderer">
                <ng-container *ngComponentOutlet="this.renderer; injector: this.rendererInjector"></ng-container>
              </ng-container>
              <ng-template #templateRenderer>
                <ng-container *ngTemplateOutlet="this.renderer"></ng-container>
              </ng-template>
            </div>
          </div>
        </ng-container>
      </div>
      <div class="attached-trigger" *ngIf="!!this.attachedTriggerTemplate" (click)="this.toggleCollapseExpand()">
        <ht-icon
          class="trigger-icon"
          icon="{{ this.isViewCollapsed ? '${IconType.ChevronUp}' : '${IconType.ChevronDown}' }}"
          size="${IconSize.Small}"
          htTooltip="{{ this.isViewCollapsed ? 'Expand Sheet' : 'Collapse Sheet' }}"
        ></ht-icon>
        <ng-container *ngTemplateOutlet="this.attachedTriggerTemplate"></ng-container>
      </div>
    </ng-container>
  `
})
export class SheetOverlayComponent {
  public readonly sheetTitle: string;
  public readonly showHeader: boolean = true;
  public readonly size: SheetSize = SheetSize.Small;
  public readonly isComponentSheet: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;
  public readonly rendererInjector: Injector;
  public visible: boolean = true;
  public readonly closeOnEscape: boolean;
  public readonly attachedTriggerTemplate?: TemplateRef<unknown>;
  public isViewCollapsed: boolean = false;

  public constructor(
    private readonly popoverRef: PopoverRef,
    @Inject(POPOVER_DATA) sheetData: SheetConstructionData,
    @Inject(GLOBAL_HEADER_HEIGHT) globalHeaderHeight: string,
    layoutChange: LayoutChangeService
  ) {
    const sheetConfig: SheetOverlayConfig = sheetData.config;
    this.showHeader = sheetConfig.showHeader === true;
    this.sheetTitle = sheetConfig.title === undefined ? '' : sheetConfig.title;
    this.size = sheetConfig.size;
    this.closeOnEscape = sheetConfig.closeOnEscapeKey ?? true;
    this.attachedTriggerTemplate = sheetConfig.attachedTriggerTemplate;

    this.isComponentSheet = !(sheetConfig.content instanceof TemplateRef);
    this.renderer = sheetConfig.content;
    this.popoverRef.height(this.getHeightForPopover(globalHeaderHeight, sheetConfig.position));
    this.popoverRef.width(this.getWidthForPopover());

    this.rendererInjector = Injector.create({
      providers: [
        {
          provide: LayoutChangeService,
          useValue: layoutChange
        }
      ],
      parent: sheetData.injector
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(): void {
    if (this.closeOnEscape) {
      this.close();
    }
  }

  public close(): void {
    this.visible = false;
    this.popoverRef.close();
  }

  public toggleCollapseExpand(): void {
    this.isViewCollapsed = !this.isViewCollapsed;

    this.popoverRef.width(this.isViewCollapsed ? '0px' : this.getWidthForPopover());
  }

  private getWidthForPopover(): string {
    switch (this.size) {
      case SheetSize.Small:
        return '320px';
      case SheetSize.Medium:
        return '600px';
      case SheetSize.Large:
        return '840px';
      case SheetSize.ExtraLarge:
        return '1280px';
      case SheetSize.ResponsiveExtraLarge:
        return '60%';
      default:
        return '100%';
    }
  }

  private getHeightForPopover(globalHeaderHeight: string, position?: PopoverFixedPositionLocation): string {
    return position === PopoverFixedPositionLocation.Right ? '100vh' : `calc(100vh - ${globalHeaderHeight})`;
  }
}
