import { APP_INITIALIZER, NgModule } from '@angular/core';
import { UserPreferenceService } from './user-preference.service';

@NgModule({
  providers: [
    UserPreferenceService,
    {
      provide: APP_INITIALIZER,
      useFactory: (userPreferenceService: UserPreferenceService) => () => userPreferenceService.addUser(),
      deps: [UserPreferenceService],
      multi: true
    }
  ]
})
export class UserPreferenceModule {}
