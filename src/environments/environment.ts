import { TimeUnit } from '../../projects/common/src/time/time-unit.type';
import {TimeDuration} from '../../projects/common/src/time/time-duration'

// tslint:disable
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  graphqlUri: 'http://localhost:2020/graphql',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
