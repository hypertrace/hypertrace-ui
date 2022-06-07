import { TemplateRef } from '@angular/core';

/** Flat to-do item node with expandable and level information */
export interface TodoItemFlatNode {
  label: string;
  item: string | TemplateRef<unknown>;
  level: number;
  expandable: boolean;
}

/* Node for to-do item
 */
export interface TodoItemNode {
  label: string;
  children?: TodoItemNode[];
  item: string | TemplateRef<unknown>;
}
