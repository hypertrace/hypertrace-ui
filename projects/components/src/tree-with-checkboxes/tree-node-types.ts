import { TemplateRef } from '@angular/core';

/** Flat to-do item node with expandable and level information */
export interface TreeItemFlatNode {
  label: string;
  item: string | TemplateRef<unknown>;
  level: number;
  expandable: boolean;
}

/* Node for to-do item
 */
export interface TreeItemNode {
  label: string;
  children?: TreeItemNode[];
  item: string | TemplateRef<unknown>;
}
