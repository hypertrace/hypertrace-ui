import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { LogDetailDataSourceModel } from './log-detail-data-source.model';

describe('Log Detail data source model', () => {
  let spectator!: SpectatorModel<LogDetailDataSourceModel>;
  const buildModel = createModelFactory();
  spectator = buildModel(LogDetailDataSourceModel);
  spectator.model.logEvent = {
    attributes: {
      key1: 'value1',
      key2: 'value2'
    }
  };

  test('test attribute data', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: expect.objectContaining({
          key1: 'value1',
          key2: 'value2'
        })
      });
    });
  });
});
