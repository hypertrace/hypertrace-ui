export function loadFreshPaint(): void;

export interface FreshPaint {
  init(orgId: string): void;
  ready(callback: () => void): void;
  identify(uid?: string, userVars?: UserVars): void;
  identify(userVars?: UserVars): void;
  track(eventName: string, properties?: {}): void;
  addEventProperties(userVars?: UserVars): void;
  addPageviewProperties(properties: { [key: string]: any }): void;
  page(category?: string, name?: string, userVars?: UserVars): void;
}

declare global {
  interface Window {
    freshpaint?: FreshPaint;
  }
}

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}
