export const enum FileUploadStatus {
  Success = 'success',
  Error = 'error'
}

export const enum FileUploadState {
  Completed = 'completed', // This takes care of error and success
  InProgress = 'in-progress',
  NotStarted = 'not-started'
}
