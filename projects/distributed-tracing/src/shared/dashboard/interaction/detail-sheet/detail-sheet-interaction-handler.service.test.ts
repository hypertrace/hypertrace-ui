import { OverlayService, SheetSize } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import {
  DetailSheetInteractionContainerComponent,
  DETAIL_SHEET_INTERACTION_MODEL
} from './container/detail-sheet-interaction-container.component';
import { DetailSheetInteractionHandlerService } from './detail-sheet-interaction-handler.service';

describe('Overlay service', () => {
  let spectator: SpectatorService<DetailSheetInteractionHandlerService>;

  const createService = createServiceFactory({
    service: DetailSheetInteractionHandlerService,
    providers: [
      mockProvider(OverlayService, {
        createSheet: jest.fn()
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  test('should call overlay service', () => {
    const detailModel = {};
    spectator.service.showSheet(detailModel, SheetSize.Medium, 'Test Title');
    const tokenMap = new Map();
    tokenMap.set(DETAIL_SHEET_INTERACTION_MODEL, detailModel);

    expect(spectator.inject(OverlayService).createSheet).toHaveBeenCalledWith(
      {
        content: DetailSheetInteractionContainerComponent,
        showHeader: true,
        size: SheetSize.Medium,
        title: 'Test Title'
      },
      expect.objectContaining({
        parent: expect.objectContaining({
          records: tokenMap
        })
      })
    );
  });
});
