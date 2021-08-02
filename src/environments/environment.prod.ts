import { TimeUnit } from '../../projects/common/src/time/time-unit.type';
import {TimeDuration} from '../../projects/common/src/time/time-duration'

export const environment = {
  production: true,
  graphqlUri: '/graphql',
  timeDurations :
    [
      new TimeDuration(15, TimeUnit.Minute),
      new TimeDuration(30, TimeUnit.Minute),
      new TimeDuration(1, TimeUnit.Hour),
      new TimeDuration(2, TimeUnit.Hour),
      new TimeDuration(3, TimeUnit.Hour),
      new TimeDuration(6, TimeUnit.Hour),
      new TimeDuration(12, TimeUnit.Hour),
      new TimeDuration(1, TimeUnit.Day),
      new TimeDuration(3, TimeUnit.Day),
      new TimeDuration(1, TimeUnit.Week),
      new TimeDuration(2, TimeUnit.Week),
      new TimeDuration(1, TimeUnit.Month)
    ]

};
