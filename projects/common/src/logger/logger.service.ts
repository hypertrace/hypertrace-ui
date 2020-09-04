/* tslint:disable:no-console */
/* tslint:disable:no-any */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  /**
   * Log provided message at info level
   */
  public info(...args: any[]): void {
    console.info(...args);
  }

  /**
   * Log provided message at debug level
   */
  public debug(...args: any[]): void {
    console.debug(...args);
  }

  /**
   * Log provided message at error level
   */
  public error(...args: any[]): void {
    console.error(...args);
  }

  /**
   * Log provided message at warn level
   */
  public warn(...args: any[]): void {
    console.warn(...args);
  }
}
