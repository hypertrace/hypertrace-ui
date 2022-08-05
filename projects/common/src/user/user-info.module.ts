import { APP_INITIALIZER, NgModule } from '@angular/core';
import { UserInfoService } from './user-info.service';
@NgModule({
  providers: [
    UserInfoService,
    {
      provide: APP_INITIALIZER,
      useFactory: (us: UserInfoService) => () => us.load(),
      deps: [UserInfoService],
      multi: true
    }
  ]
})
export class UserModule {}
