import { Injectable } from '@angular/core';
import { OverlayService, PopoverRef, SheetSize } from '@hypertrace/components';
import { DetailSheetInteractionContainerComponent } from './container/detail-sheet-interaction-container.component';

@Injectable({
  providedIn: 'root'
})
export class DetailSheetInteractionHandlerService {
  public constructor(private readonly overlayService: OverlayService) {}

  public showSheet(
    detailModel: object,
    sheetSize: SheetSize = SheetSize.Medium,
    title?: string,
    showHeader: boolean = true
  ): PopoverRef {
    return this.overlayService.createSheet({
      content: DetailSheetInteractionContainerComponent,
      size: sheetSize,
      showHeader: showHeader,
      title: title,
      data: detailModel
    });
  }
}
