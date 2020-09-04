import { SheetSize } from '@hypertrace/components';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { MODEL_API } from '@hypertrace/hyperdash-angular';
import { mockProvider } from '@ngneat/spectator/jest';
import { DetailSheetInteractionHandlerModel } from './detail-sheet-interaction-handler.model';
import { DetailSheetInteractionHandlerService } from './detail-sheet-interaction-handler.service';

describe('Detail Sheet Interaction Handler Model', () => {
  const buildModel = createModelFactory({
    providers: [
      mockProvider(DetailSheetInteractionHandlerService, {
        showSheet: jest.fn()
      }),
      {
        provide: MODEL_API,
        useValue: {
          createChild: jest.fn(),
          setVariable: jest.fn()
        }
      }
    ]
  });

  test('should work with default values', () => {
    const modelJson = {
      type: 'text-widget',
      // tslint:disable-next-line: no-invalid-template-strings
      text: '${source}'
    };

    const mockModelObject = {};
    const modelApi = {
      createChild: jest.fn().mockReturnValue(mockModelObject),
      setVariable: jest.fn()
    };

    const spectator = buildModel(DetailSheetInteractionHandlerModel, {
      api: modelApi,
      properties: {
        detailTemplate: modelJson
      }
    });

    const data = 'Test';
    spectator.model.execute(data);

    expect(modelApi.createChild).toHaveBeenCalledWith(modelJson);
    expect(modelApi.setVariable).toHaveBeenCalledWith('source', data, mockModelObject);
    expect(spectator.get(DetailSheetInteractionHandlerService).showSheet).toHaveBeenCalledWith(
      mockModelObject,
      SheetSize.Large,
      undefined,
      true
    );
  });

  test('should work with custom values', () => {
    const modelJson = {
      type: 'text-widget',
      // tslint:disable-next-line: no-invalid-template-strings
      text: '${source.value}'
    };

    const mockModelObject = {};
    const modelApi = {
      createChild: jest.fn().mockReturnValue(mockModelObject),
      setVariable: jest.fn()
    };

    const spectator = buildModel(DetailSheetInteractionHandlerModel, {
      api: modelApi,
      properties: {
        detailTemplate: modelJson,
        injectSourceAs: 'record',
        sheetSize: SheetSize.Medium,
        titlePropertyPath: 'type'
      }
    });

    const data = {
      value: 'Test',
      type: 'Test Type'
    };
    spectator.model.execute(data);

    expect(modelApi.createChild).toHaveBeenCalledWith(modelJson);
    expect(modelApi.setVariable).toHaveBeenCalledWith('record', data, mockModelObject);
    expect(spectator.get(DetailSheetInteractionHandlerService).showSheet).toHaveBeenCalledWith(
      mockModelObject,
      SheetSize.Medium,
      'Test Type',
      true
    );
  });
});
