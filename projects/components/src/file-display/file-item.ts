export interface FileItem {
  data: File;
  progress?: number; // Calculated in percentage
  inProgress?: boolean;
}
