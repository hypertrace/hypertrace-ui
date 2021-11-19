import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { GraphQlTimeRange } from '../graphql/model/schema/timerange/graphql-time-range';

export const getPreviousTimeRange = (timeRange: GraphQlTimeRange): GraphQlTimeRange => {
  const requiredDuration: TimeDuration = new TimeDuration(
    timeRange.asArgumentObject().endTime.getTime() - timeRange.asArgumentObject().startTime.getTime(),
    TimeUnit.Millisecond
  );

  return new GraphQlTimeRange(
    timeRange.asArgumentObject().startTime.getTime() - requiredDuration.getAmountForUnit(TimeUnit.Millisecond),
    timeRange.asArgumentObject().startTime.getTime()
  );
};

export const getDurationFromTimeRange = (timeRange: GraphQlTimeRange): TimeDuration =>
  new TimeDuration(
    timeRange.asArgumentObject().endTime.getTime() - timeRange.asArgumentObject().startTime.getTime(),
    TimeUnit.Millisecond
  );
