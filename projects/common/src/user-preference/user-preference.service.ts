import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserInfoService } from './../user/user-info.service';
interface TokenOptions {
  uri: string;
}
export const USER_PREFERENCES_OPTIONS = new InjectionToken<TokenOptions>('USER_PREFERENCE_OPTIONS');

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  public BASE_URL: string;
  public hasLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public constructor(
    private readonly http: HttpClient,
    @Inject(USER_PREFERENCES_OPTIONS) tokenOptions: TokenOptions,
    private readonly userInfoService: UserInfoService
  ) {
    this.BASE_URL = tokenOptions.uri;
  }

  private addUserEmailHeader(): HttpHeaders {
    const requestHeaders = new HttpHeaders();
    const { email } = this.userInfoService.getUserData();

    return requestHeaders.append('user-email', email!);
  }

  /**
   * We call the /user/add endpoint of the Hypertrace User Service once on
   * every application load. This adds the user to the service if not present
   * already. More details: https://razorpay.slack.com/archives/CU5GKS8MQ/p1659328334493179?thread_ts=1659310225.849849&cid=CU5GKS8MQ
   */
  public addUser(): void {
    this.userInfoService.load().subscribe(() =>
      this.get<{ success: boolean }>('/v1/user/add').subscribe(({ success }) => {
        if (success) {
          this.hasLoaded.next(true);
        }
      })
    );
  }

  public get<T>(endPoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.BASE_URL + endPoint, {
      params: params,
      headers: this.addUserEmailHeader()
    });
  }

  public post<T>(endPoint: string, body: object): Observable<T> {
    return this.http.post<T>(this.BASE_URL + endPoint, body, {
      headers: this.addUserEmailHeader()
    });
  }

  public put<T>(endPoint: string, body: object): Observable<T> {
    return this.http.put<T>(this.BASE_URL + endPoint, body, {
      headers: this.addUserEmailHeader()
    });
  }

  public delete<T>(endPoint: string): Observable<T> {
    return this.http.delete<T>(this.BASE_URL + endPoint, {
      headers: this.addUserEmailHeader()
    });
  }
}
