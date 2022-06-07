import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { remove } from 'lodash';
import { ButtonStyle } from '../button/button';
import { TodoItemFlatNode, TodoItemNode } from './types';

@Component({
  selector: 'ht-tree-with-checkboxes',
  styleUrls: ['./tree-with-checkboxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-tree [dataSource]="this.dataSource" [treeControl]="this.treeControl">
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
        <ht-checkbox
          class="checklist-leaf-node"
          [checked]="this.checklistSelection.isSelected(node)"
          (checkedChange)="this.todoLeafItemSelectionToggle(node, $event)"
          [label]="node.item"
        ></ht-checkbox>
      </mat-tree-node>

      <mat-tree-node *matTreeNodeDef="let node; when: this.hasChild" matTreeNodePadding>
        <ht-button
          matTreeNodeToggle
          [icon]="this.treeControl.isExpanded(node) ? '${IconType.ChevronDown}' : '${IconType.ChevronRight}'"
          [display]="'${ButtonStyle.PlainText}'"
        >
        </ht-button>
        <ht-checkbox
          [checked]="this.descendantsAllSelected(node)"
          [indeterminate]="this.descendantsPartiallySelected(node)"
          (checkedChange)="this.todoItemSelectionToggle(node, $event)"
          [label]="node.item"
        ></ht-checkbox>
      </mat-tree-node>
    </mat-tree>
  `
})
export class TreeWithCheckboxesComponent implements OnChanges {
  @Input()
  public data: TodoItemNode[] = [];

  @Output()
  public readonly onSelectionToggle: EventEmitter<{ item: string; parent: string | undefined }[]> = new EventEmitter();

  public dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  public treeControl: FlatTreeControl<TodoItemFlatNode>;

  /** The selection for checklist */
  public checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  private flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  private nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  private treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  private selections: { item: string; parent: string | undefined }[] = [];

  public constructor() {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data) {
      this.dataSource.data = this.data;
    }
  }

  /** Whether all the descendants of the node are selected. */
  public descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);

    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  public descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  public todoItemSelectionToggle(node: TodoItemFlatNode, event: boolean): void {
    if (event === true) {
      this.insertIntoSelections(node);
    } else {
      this.removeFromSelections(node);
    }

    this.onSelectionToggle.emit(this.selections);

    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  public todoLeafItemSelectionToggle(node: TodoItemFlatNode, event: boolean): void {
    if (event === true) {
      this.insertIntoSelections(node);
    } else {
      this.removeFromSelections(node);
    }

    this.onSelectionToggle.emit(this.selections);

    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  public hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  private getLevel = (node: TodoItemFlatNode) => node.level;

  private isExpandable = (node: TodoItemFlatNode) => node.expandable;

  private getChildren = (node: TodoItemNode): TodoItemNode[] => node.children ?? [];

  private insertIntoSelections(node: TodoItemFlatNode): void {

    if (node.expandable) {
      this.treeControl.getDescendants(node).forEach(node =>
        {
          const selection = {
            item: node.item,
            parent: this.getParentNode(node)?.item
          };

          if(!this.selections.map(data => JSON.stringify(data)).includes(JSON.stringify(selection))){
            this.selections.push(selection)
          }
        }
      );
    } else {
      this.selections.push({
        item: node.item,
        parent: this.getParentNode(node)?.item
      });
    }
  }

  private removeFromSelections(node: TodoItemFlatNode): void {
    if (node.expandable) {
      const descendants = this.treeControl.getDescendants(node).map(node => JSON.stringify({item: node.item, parent: this.getParentNode(node)?.item}));
      this.selections = this.selections.filter(selection => {
        return !descendants.includes(JSON.stringify(selection));
      });
    } else {
      remove(this.selections, selection => selection.item === node.item);
    }
  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  private transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : {
            item: node.item,
            level: level,
            expandable: !!node.children?.length
          };
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
