import { Observable } from 'rxjs';

export interface DownloadFileMetadata {
  dataSource: Observable<string>; // This should be a stringified data for any file
  fileName: string;
}
