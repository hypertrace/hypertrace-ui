import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { TimeDurationModel } from '@hypertrace/dashboards';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';

describe('Time Duration model', () => {
  let spectator!: SpectatorModel<TimeDurationModel>;

  const buildModel = createModelFactory();

  beforeEach(() => {
    spectator = buildModel(TimeDurationModel);
  });

  test('builds expected time duration object', () => {
    spectator.model.value = 1;
    spectator.model.unit = TimeUnit.Hour;

    expect(spectator.model.getDuration()).toEqual(expect.objectContaining(new TimeDuration(1, TimeUnit.Hour)));

    spectator.model.value = 2;
    spectator.model.unit = TimeUnit.Day;

    expect(spectator.model.getDuration()).toEqual(expect.objectContaining(new TimeDuration(2, TimeUnit.Day)));
  });
});
