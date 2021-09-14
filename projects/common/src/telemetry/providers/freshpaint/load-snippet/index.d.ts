export function loadFreshPaint(): FreshPaint;

export interface FreshPaint {
  init(orgId: string): void;
  identify(uid?: string, userVars?: UserVars): void;
  identify(userVars?: UserVars): void;
  track(eventName: string, properties?: {}): void;
  addEventProperties(userVars?: UserVars): void;
  page(): void;
}

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}
