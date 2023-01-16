import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  HostListener,
  Inject,
  Injector,
  TemplateRef,
  Type,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ExternalNavigationParams, GlobalHeaderHeightProviderService, LayoutChangeService } from '@hypertrace/common';
import { isNil } from 'lodash-es';
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
      <div class="sheet-overlay" [style.padding.px]="this.hasDefaultPadding ? 24 : 0">
        <ng-container *ngIf="!this.isViewCollapsed">
          <div *ngIf="this.showHeader" class="header">
            <ng-container *ngIf="!this.isSheetTitleAString; else defaultSheetTitleTemplate">
              <ng-container *ngTemplateOutlet="this.sheetTitle"></ng-container>
            </ng-container>
            <div class="action-buttons">
              <ht-open-in-new-tab
                *ngIf="this.navigationParams"
                [paramsOrUrl]="this.navigationParams"
              ></ht-open-in-new-tab>
              <ht-button
                class="close-button"
                icon="${IconType.CloseCircle}"
                display="${ButtonStyle.Outlined}"
                htTooltip="Close Sheet"
                (click)="this.close()"
              >
              </ht-button>
            </div>
            <ng-template #defaultSheetTitleTemplate>
              <h3 class="default-header-title">{{ this.sheetTitle }}</h3>
            </ng-template>
          </div>
          <div class="content-wrapper">
            <div class="content">
              <ng-container *ngIf="this.isComponentSheet; else templateRenderer">
                <ng-container
                  #componentTemplate
                  *ngComponentOutlet="this.renderer; injector: this.rendererInjector"
                ></ng-container>
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
        ></ht-icon>
        <ng-container *ngTemplateOutlet="this.attachedTriggerTemplate"></ng-container>
      </div>
    </ng-container>
  `
})
export class SheetOverlayComponent {
  public readonly sheetTitle: string | TemplateRef<unknown>;
  public readonly showHeader: boolean = true;
  public readonly size: SheetSize = SheetSize.Small;
  public readonly hasDefaultPadding: boolean = true;
  public readonly isComponentSheet: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;
  public readonly rendererInjector: Injector;
  public visible: boolean = true;
  public readonly closeOnEscape: boolean;
  public readonly attachedTriggerTemplate?: TemplateRef<unknown>;
  public readonly isSheetTitleAString: boolean;
  public isViewCollapsed: boolean;
  public navigationParams: ExternalNavigationParams | undefined;
  private onClose?: (contentTemplate: unknown) => void;

  @ViewChild('templateRenderer')
  private readonly templateRenderer!: ComponentRef<unknown>;

  public constructor(
    private readonly popoverRef: PopoverRef,
    private readonly globalHeaderHeightProvider: GlobalHeaderHeightProviderService,
    @Inject(POPOVER_DATA) sheetData: SheetConstructionData,
    layoutChange: LayoutChangeService
  ) {
    const sheetConfig: SheetOverlayConfig = sheetData.config;
    this.hasDefaultPadding = sheetConfig.hasDefaultPadding ?? true;
    this.showHeader = sheetConfig.showHeader === true;
    this.sheetTitle = sheetConfig.title === undefined ? '' : sheetConfig.title;
    this.isSheetTitleAString = typeof this.sheetTitle === 'string';
    this.size = sheetConfig.size;
    this.closeOnEscape = sheetConfig.closeOnEscapeKey ?? true;
    this.onClose = sheetConfig.onClose;
    this.attachedTriggerTemplate = sheetConfig.attachedTriggerTemplate;
    this.isViewCollapsed = !!this.attachedTriggerTemplate;

    this.isComponentSheet = !(sheetConfig.content instanceof TemplateRef);
    this.renderer = sheetConfig.content;
    this.popoverRef.height(
      this.getHeightForPopover(this.globalHeaderHeightProvider.globalHeaderHeight, sheetConfig.position)
    );
    this.setWidth();
    this.navigationParams = sheetConfig.pageNavParams;
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
      this.handleCloseOnEscape();
    }
  }

  public close(): void {
    if (this.onClose) {
      this.onClose(this.templateRenderer);
    } else {
      this.visible = false;
      this.popoverRef.close();
    }
  }

  public toggleCollapseExpand(): void {
    this.isViewCollapsed = !this.isViewCollapsed;

    this.setWidth();
  }

  private setWidth(): void {
    this.popoverRef.width(this.isViewCollapsed ? '0px' : this.getWidthForPopover());
  }

  private handleCloseOnEscape(): void {
    if (!isNil(this.attachedTriggerTemplate)) {
      if (!this.isViewCollapsed) {
        this.toggleCollapseExpand();
      }
    } else {
      this.close();
    }
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
