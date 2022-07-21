import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { uniqueId } from 'lodash-es';
import { fromEvent, Observable, of, Subscription } from 'rxjs';
import { catchError, delay, filter, finalize, map, shareReplay } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly activeSubscriptionsMap: Map<string, Subscription> = new Map<string, Subscription>();
  private beforeUnloadSubscription?: Subscription;

  public constructor(private readonly http: HttpClient, private readonly notificationService: NotificationService) {}

  public uploadFilesAsFormDataAsync<TResponse extends object>(
    url: string,
    formData: FormData
  ): Observable<FileUploadEvent<TResponse>> {
    if (this.beforeUnloadSubscription === undefined) {
      this.addBeforeUnloadHandler();
    }

    const fileUploadId = uniqueId('file-upload');
    const upload$ = this.uploadFilesAsFormData<TResponse>(url, formData).pipe(
      delay(100),
      finalize(() => {
        this.onUploadComplete(fileUploadId);
      }),
      shareReplay(1)
    );

    /**
     * Subscribe inside a root scope to ensure that the subscription is not cancelled when the component is destroyed
     */
    const uploadSubscription = upload$.subscribe();
    this.activeSubscriptionsMap.set(fileUploadId, uploadSubscription);

    return upload$;
  }

  public uploadFilesAsFormData<TResponse extends object>(
    url: string,
    formData: FormData
  ): Observable<FileUploadEvent<TResponse>> {
    return this.http
      .post(url, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress) {
            return {
              type: FileUploadEventType.Progress,
              progress: Math.round((event.loaded * 100) / event.total!)
            };
          }

          if (event.type === HttpEventType.Response) {
            if (event.ok && event.status === 200) {
              return {
                type: FileUploadEventType.Success,
                response: event.body as TResponse
              };
            }

            // Error Response
            throw new Error(`File upload failed with status ${event.status}`);
          }

          return undefined;
        }),
        this.notificationService.withNotification(`File upload successful`, `File upload failed`),
        catchError(error =>
          of({
            type: FileUploadEventType.Failure,
            error: error
          })
        ),
        filter((uploadData): uploadData is FileUploadEvent<TResponse> => uploadData !== undefined)
      );
  }
  private addBeforeUnloadHandler(): void {
    // Prevent user from navigating away from the page using browser back / refresh / tab close if there are pending updates

    this.beforeUnloadSubscription = fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe($event => {
      // In IE, this string is displayed in the warning popup.
      // Other browsers use the presence of a string to trigger default popup.
      $event.returnValue = 'File upload in progress. Leaving the page will result in cancelling the upload.';
    });
  }

  private onUploadComplete(fileUploadId: string): void {
    this.activeSubscriptionsMap.delete(fileUploadId);

    if (this.activeSubscriptionsMap.size === 0) {
      // No more pending uploads. Clear the before unload handler
      this.beforeUnloadSubscription?.unsubscribe();
      this.beforeUnloadSubscription = undefined;
    }
  }
}

export declare type FileUploadEvent<T> = FileUploadProgressEvent | FileUploadSuccessEvent<T> | FileUploadFailureEvent;

export interface FileUploadProgressEvent {
  type: FileUploadEventType.Progress;
  progress: number;
}

export interface FileUploadSuccessEvent<TResponse> {
  type: FileUploadEventType.Success;
  response: TResponse;
}

export interface FileUploadFailureEvent {
  type: FileUploadEventType.Failure;
  error: string;
}

export const enum FileUploadEventType {
  Success = 'success',
  Failure = 'failure',
  Progress = 'progress'
}
