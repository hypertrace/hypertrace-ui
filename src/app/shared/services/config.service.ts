import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config: any;

      constructor(private http: HttpClient) {}

      loadConfig() {

        return this.http
          .get<any>('./assets/config.json')
          .toPromise()
          .then(config => {
            this.config = config;
          }).catch(err => {
          console.log("🚀 ~ file: config.service.ts ~ line 21 ~ ConfigService ~ loadConfig ~ err", err)


          });
      }
}
