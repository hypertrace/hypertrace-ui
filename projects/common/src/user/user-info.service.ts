import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { UserTraits } from '../telemetry/telemetry';
import { LocalStorage } from '../utilities/browser/storage/local-storage';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  public BASE_URL: string = '/user-preferences';
  public static readonly STORAGE_KEY: string = 'user-data';
  public static readonly DEFAULT_USER: UserTraits = { id: 2, name: 'ht-user', email: 'ht-user@razorpay.com' };
  public constructor(
    private readonly http: HttpClient,
    private readonly localStorage: LocalStorage,
    private readonly logger: LoggerService
  ) {}

  public load(): Observable<UserTraits> {
    // tslint:disable-next-line: ban-ts-ignore
    // @ts-ignore
    if (process.env.NODE_ENV === 'development') {
      return of({});
    }

    // Check if user info is already present in local storage
    // Return the value without making the api call
    const userInfo = this.getUserData();
    if (userInfo !== UserInfoService.DEFAULT_USER) {
      return of(userInfo);
    }

    return this.http.get<UserTraits>('/user-info').pipe(
      tap((data: UserTraits) => {
        if (data.email !== '') {
          this.localStorage.set(UserInfoService.STORAGE_KEY, JSON.stringify(data));
        }
      }),
      catchError(error => {
        this.logger.error('Something went wrong while fetching /user-info', error);

        return of({});
      })
    );
  }

  public getUserData(): UserTraits {
    const user = this.localStorage.get(UserInfoService.STORAGE_KEY);
    if (user !== undefined) {
      return JSON.parse(user);
    }

    return UserInfoService.DEFAULT_USER;
  }
}
