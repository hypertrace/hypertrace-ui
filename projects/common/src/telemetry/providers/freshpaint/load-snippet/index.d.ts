export function loadFreshPaint(): FreshPaint;

export interface FreshPaint {
  init(orgId: string): void;
  page(): void;
}
