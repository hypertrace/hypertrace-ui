import { ChangeDetectionStrategy, Component, Inject, Injector, TemplateRef, Type } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { GLOBAL_HEADER_HEIGHT, LayoutChangeService } from '@hypertrace/common';
import { ButtonStyle } from '../../button/button';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetConstructionData } from '../overlay.service';
import { SheetOverlayConfig, SheetSize } from './sheet';

@Component({
  selector: 'ht-sheet-overlay',
  styleUrls: ['./sheet-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="sheet-overlay" [ngClass]="'sheet-size-' + this.size">
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
    </div>
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
    this.isComponentSheet = !(sheetConfig.content instanceof TemplateRef);
    this.renderer = sheetConfig.content;
    this.popoverRef.height(`calc(100vh - ${globalHeaderHeight})`);

    if (this.size === SheetSize.ResponsiveExtraLarge) {
      this.popoverRef.width('60%');
    }

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

  public close(): void {
    this.visible = false;
    this.popoverRef.close();
  }
}
