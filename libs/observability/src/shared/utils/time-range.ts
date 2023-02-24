import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { GraphQlTimeRange } from '../graphql/model/schema/timerange/graphql-time-range';

export const getPreviousTimeRange = (timeRange: GraphQlTimeRange): GraphQlTimeRange => {
  const requiredDuration: TimeDuration = timeRange.asTimeDuration();

  return new GraphQlTimeRange(
    timeRange.asArgumentObject().startTime.getTime() - requiredDuration.getAmountForUnit(TimeUnit.Millisecond),
    timeRange.asArgumentObject().startTime.getTime()
  );
};
